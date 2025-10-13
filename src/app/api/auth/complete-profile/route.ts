import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]";
import bcrypt from 'bcryptjs';

// Helper to extract token from request if available
const extractTokenFromRequest = (request: NextRequest) => {
  try {
    // Try to get token from URL query parameter
    const tokenParam = request.nextUrl.searchParams.get('token');
    if (tokenParam) {
      return JSON.parse(decodeURIComponent(tokenParam));
    }
    
    // Try to get token from headers
    const headerToken = request.headers.get('X-Auth-Token');
    if (headerToken) {
      try {
        return JSON.parse(decodeURIComponent(headerToken));
      } catch (e) {
        console.log('Failed to parse header token, might be raw token');
        // Continue to try other methods
      }
    }
    
    // Try to get token from request body
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const body = request.clone().json(); // Clone request to avoid consuming the body
      return body.then(data => {
        if (data._tokenData) {
          try {
            return typeof data._tokenData === 'string' 
              ? JSON.parse(data._tokenData) 
              : data._tokenData;
          } catch (e) {
            console.error('Failed to parse _tokenData from request body', e);
          }
        }
        return null;
      }).catch(e => {
        console.error('Failed to read request body', e);
        return null;
      });
    }
  } catch (error) {
    console.error('Failed to extract token from request:', error);
  }
  return null;
};

export async function POST(request: NextRequest) {
  console.log('Complete Profile API: Processing profile completion request');
  
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    // Get token data from URL if available (for OAuth flows)
    const tokenData = await extractTokenFromRequest(request);
    
    console.log('Complete Profile API: Session state:', {
      hasSession: !!session,
      userEmail: session?.user?.email || 'none',
      userRole: (session?.user as any)?.role || 'unknown',
      hasTokenData: !!tokenData,
      tokenRole: tokenData?.role || 'none',
      tokenEmail: tokenData?.email || 'none',
      tokenProvider: tokenData?.provider || 'none'
    });

    // Allow token-based authentication if session is missing but valid token is present
    let userEmail = session?.user?.email;
    let isTokenAuth = false;
    
    if (!session || !session.user || !session.user.email) {
      // Check if we have valid token data that can be used for authentication
      if (tokenData && tokenData.email && (tokenData.role === 'pending' || tokenData.provider === 'google')) {
        console.log(`Complete Profile API: Using token-based authentication for ${tokenData.email}`);
        userEmail = tokenData.email;
        isTokenAuth = true;
      } else {
        console.error('Complete Profile API: No authenticated session and no valid token');
        return NextResponse.json({
          error: "Not authenticated",
        }, { status: 401 });
      }
    }
    
    // Check if user role is pending - this is the only role allowed to complete profile
    // Handle both session-based and token-based auth
    let userRole = 'unknown';
    if (session && session.user) {
      userRole = (session.user as any)?.role || 'unknown';
    } else if (isTokenAuth && tokenData) {
      userRole = tokenData.role || 'unknown';
    }
    
    console.log(`Complete Profile API: User role check - current role: ${userRole}`);
    
    // For OAuth users, we might have a pending role from token but not yet in session
    // Allow completion if we have token data indicating they are in OAuth flow
    const isOAuthFlow = tokenData && tokenData.provider === 'google';
    const isPendingRole = userRole === 'pending' || (isOAuthFlow && tokenData?.role === 'pending');
    
    if (!isPendingRole) {
      console.log(`Complete Profile API: Attempt to complete profile with non-pending role: ${userRole}`);
      
      // If they already have a role other than pending, they shouldn't be completing the profile
      if (userRole === 'waiting_list' || ['admin', 'manager', 'sponsor', 'visitor'].includes(userRole)) {
        return NextResponse.json({
          error: "Profile already completed",
          redirectTo: userRole === 'waiting_list' ? '/comingsoon' : '/dashboard'
        }, { status: 403 });
      }
      
      // Special case for OAuth flows - allow completion even if role hasn't been properly set
      if (isOAuthFlow) {
        const tokenEmail = tokenData?.email || '';
        const sessionEmail = session?.user?.email || '';
        
        // Allow if either using token auth or if the emails match (for session auth)
        if (isTokenAuth || tokenEmail === sessionEmail) {
          console.log('Complete Profile API: Allowing OAuth user to complete profile despite role mismatch');
          // Continue with profile completion
        } else {
          console.log(`Complete Profile API: Email mismatch: token=${tokenEmail}, session=${sessionEmail}`);
          // Unknown role or email mismatch - treat as error
          return NextResponse.json({
            error: "Invalid user role or email mismatch for profile completion",
          }, { status: 403 });
        }
      } else {
        // Unknown role - treat as error
        return NextResponse.json({
          error: "Invalid user role for profile completion",
        }, { status: 403 });
      }
    }

    // Get the form data from the request
    const formData = await request.json();
    
    // If form data doesn't include email but we have token data, use that
    if (isTokenAuth && tokenData && (!formData.email || formData.email === '')) {
      formData.email = tokenData.email;
      console.log('Complete Profile API: Added email from token data:', tokenData.email);
    }
    
    // If token is from Google OAuth, ensure googleAuthenticated flag is set
    if (isTokenAuth && tokenData?.provider === 'google') {
      formData.googleAuthenticated = true;
      console.log('Complete Profile API: Setting googleAuthenticated flag based on token');
    }
    
    console.log('Complete Profile API: Form data received:', {
      hasName: !!formData.full_name,
      hasEmail: !!formData.email,
      hasCountry: !!formData.country,
      hasRoles: !!formData.roles,
      googleAuthenticated: formData.googleAuthenticated,
      tokenAuth: isTokenAuth
    });
    
    // Connect to database
    const { getCloudConnection } = await import("@/lib/mongodb-cloud");
    const conn = await getCloudConnection();
    
    // Check if user exists using either session email or token email
    const existingUser = await conn.db.collection('users').findOne({ 
      email: userEmail.toLowerCase()
    });

    if (!existingUser) {
      console.error(`Complete Profile API: User not found for email ${userEmail}`);
      return NextResponse.json({ 
        error: "User not found",
      }, { status: 404 });
    }
    
    // Log the authentication method used
    console.log(`Complete Profile API: Authentication method for ${userEmail}: ${isTokenAuth ? 'token-based' : 'session-based'}`);

    // Check if all required fields are provided
    const requiredFields = ['full_name', 'country', 'roles'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.error(`Missing required fields for ${userEmail}: ${missingFields.join(', ')}`);
      
      // Check specifically for country field to provide a clearer error message
      if (missingFields.includes('country')) {
        return NextResponse.json({ 
          error: `Missing required field: Country`,
        }, { status: 400 });
      } else {
        return NextResponse.json({ 
          error: `Missing required fields: ${missingFields.join(', ')}`,
        }, { status: 400 });
      }
    }
    
    // Make sure roles is an array with at least one value
    if (!Array.isArray(formData.roles) || formData.roles.length === 0) {
      console.error(`Invalid roles for ${userEmail}: ${JSON.stringify(formData.roles)}`);
      return NextResponse.json({ 
        error: "At least one role must be selected",
      }, { status: 400 });
    }
    
    // Update user with the registration data
    // We don't update email since we're using the authenticated session email
    // We don't need to update password if they authenticated with Google
    
    const updateData: any = {
      // Default fields to update
      registrationCompleted: true,
      role: 'waiting_list', // Assign waiting_list role after completing questionnaire (change from pending to waiting_list)
      roleUpdatedAt: new Date(), // Track when the role was updated
      updatedAt: new Date(),
    };
    
    // Log the role change for debugging
    console.log(`Updating user ${userEmail} role from ${existingUser.role || 'unknown'} to waiting_list after profile completion`);
    
    // Add all form fields to the update except sensitive fields
    Object.keys(formData).forEach(key => {
      if (key !== 'email' && key !== 'googleAuthenticated' && key !== 'password') {
        updateData[key] = formData[key];
      }
    });
    
    // If a password was provided (not using OAuth), hash it
    if (formData.password && !formData.googleAuthenticated) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(formData.password, salt);
    }
    
    // Update the user record
    const result = await conn.db.collection('users').updateOne(
      { email: userEmail.toLowerCase() },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ 
        error: "Failed to update user profile",
      }, { status: 500 });
    }

    // Also save the complete form data to a 'responses' collection for analytics
    try {
      // Include additional metadata with the response
      const responseData = {
        ...formData,
        userId: existingUser._id,
        userEmail: userEmail.toLowerCase(),
        completedAt: new Date(),
        authType: formData.googleAuthenticated ? 'google' : 'email',
        // Track role change explicitly in the response record
        previousRole: existingUser.role || 'unknown',
        newRole: 'waiting_list',
        // Track authentication method used for profile completion
        authMethod: isTokenAuth ? 'token' : 'session'
      };

      // Store the complete response - this confirms that profile is complete and role should be waiting_list
      const responseResult = await conn.db.collection('responses').insertOne(responseData);
      
      if (!responseResult.insertedId) {
      // If we couldn't create the response record, return an error
      console.error(`Failed to create responses record for ${userEmail}`);
      return NextResponse.json({ 
        error: "Failed to complete registration process",
      }, { status: 500 });
    }
    
    console.log(`Successfully created responses record for ${userEmail} with ID ${responseResult.insertedId}, confirming role change to waiting_list`);      // Verify the user now has waiting_list role in the database
      const updatedUser = await conn.db.collection('users').findOne({
        email: userEmail.toLowerCase()
      });
      
      if (!updatedUser || updatedUser.role !== 'waiting_list') {
        console.error(`Role verification failed for ${userEmail}: current role = ${updatedUser?.role || 'unknown'}`);
        // Try to fix it if needed
        if (updatedUser) {
          await conn.db.collection('users').updateOne(
            { email: userEmail.toLowerCase() },
            { $set: { role: 'waiting_list', roleFixedAt: new Date() } }
          );
          console.log(`Fixed role for ${userEmail} to waiting_list`);
        }
      }
      
    } catch (responseError) {
      // For response collection errors, log but still consider the profile complete if user was updated
      console.error('Failed to save to responses collection:', responseError);
    }

    // Don't try to refresh the session on the server side for token-based auth,
    // instead we'll include instructions for the client to do this
    const shouldRefreshSession = !isTokenAuth && !!session;
    
    if (shouldRefreshSession) {
      try {
        console.log('Complete Profile API: Forcing session refresh to update role');
        // Try a more aggressive session refresh
        await fetch('/api/auth/session?update=true', { 
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      } catch (refreshError) {
        console.error('Failed to refresh session after profile completion:', refreshError);
      }
    } else {
      console.log('Complete Profile API: Skipping server-side session refresh for token-based auth');
    }
    
    // Return success with explicit role information
    return NextResponse.json({ 
      success: true,
      message: "Profile completed successfully",
      previousRole: existingUser.role || 'unknown',
      currentRole: "waiting_list",
      roleUpdated: true,
      redirectTo: '/comingsoon',
      // Include information about authentication method
      authMethod: isTokenAuth ? 'token' : 'session',
      // Flag to tell client to refresh session (needed especially for token auth)
      refreshSession: true
    });
  } catch (error) {
    console.error("Error completing profile:", error);
    return NextResponse.json({ 
      error: "Failed to complete profile",
    }, { status: 500 });
  }
}