import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({
        error: "Not authenticated",
        isComplete: false
      }, { status: 401 });
    }

    // Connect to database
    try {
      const { getCloudConnection } = await import("@/lib/mongodb-cloud");
      const conn = await getCloudConnection();
    
    // Check if the user has a complete profile
    const user = await conn.db.collection('users').findOne({ 
      email: session.user.email
    });

    if (!user) {
      return NextResponse.json({ 
        error: "User not found",
        isComplete: false
      }, { status: 404 });
    }

    // Extract token data from URL if available for better debugging
    const tokenParam = request.nextUrl.searchParams.get('token');
    let tokenData = null;
    if (tokenParam) {
      try {
        tokenData = JSON.parse(decodeURIComponent(tokenParam));
        console.log(`Profile check: Found token data in URL:`, {
          tokenRole: tokenData.role,
          tokenEmail: tokenData.email,
          tokenProvider: tokenData.provider
        });
      } catch (error) {
        console.error('Failed to parse token param:', error);
      }
    }
    
    // Define what constitutes a complete profile - must check for actual questionnaire answers
    // Check for the presence of required questionnaire fields
    const hasRequiredFields = Boolean(
      user.full_name &&                  // User provided their full name
      user.country &&                    // User provided their country (critical field, even with OAuth)
      user.roles &&                      // User selected at least one role
      Array.isArray(user.roles) && user.roles.length > 0 // Ensure roles is an array with values
    );
    
    console.log(`Profile check: Required fields check for ${user.email}:`, {
      hasFullName: !!user.full_name,
      hasCountry: !!user.country,
      hasRoles: !!user.roles && Array.isArray(user.roles),
      rolesCount: Array.isArray(user.roles) ? user.roles.length : 0,
      role: user.role,
      authMethod: user.googleAuthenticated ? 'Google OAuth' : 'Email/Password'
    });
    
    // Check if user has a response in the responses collection - this confirms completion
    let hasStoredResponse = false;
    try {
      const response = await conn.db.collection('responses').findOne({
        userEmail: user.email.toLowerCase()
      });
      hasStoredResponse = Boolean(response);
      console.log(`Profile check: User ${user.email} has ${hasStoredResponse ? 'completed' : 'not completed'} the questionnaire`);
      
      if (hasStoredResponse) {
        console.log(`Profile check: Response record exists with these fields:`, {
          hasFullName: !!response.full_name,
          hasCountry: !!response.country,
          hasRoles: !!response.roles && Array.isArray(response.roles),
          rolesCount: Array.isArray(response.roles) ? response.roles.length : 0,
          completedAt: response.completedAt,
          authType: response.authType || 'unknown'
        });
      }
    } catch (error) {
      console.error('Error checking responses collection:', error);
    }
    
    // Check specifically for country field as it's often missing with OAuth
    const hasCountry = Boolean(user.country);
    if (!hasCountry) {
      console.log(`CRITICAL FIELD MISSING: User ${user.email} is missing required Country field. Auth method: ${user.googleAuthenticated ? 'Google OAuth' : 'Email/Password'}`);
    } else {
      console.log(`Country field verification passed for ${user.email}: ${user.country}`);
    }
    
    const isComplete = Boolean(
      user.name &&                       // User has provided their name
      user.email &&                      // User has an email
      user.role !== 'pending' &&         // User does not have the 'pending' role
      (user.registrationCompleted || hasStoredResponse) && // Registration was marked complete or has a stored response
      hasRequiredFields                  // User has actually provided required questionnaire answers
    );
    
    // Log detailed profile check for debugging
    console.log(`Profile check for ${user.email}: ${isComplete ? 'COMPLETE' : 'INCOMPLETE'}, role: ${user.role}, hasRequiredFields: ${hasRequiredFields}`);
    
    // Always force pending role if required fields are missing, regardless of current role
    if (!hasRequiredFields) {
      // User is missing required form fields - this is a mandatory redirect case
      console.log(`ENFORCING POLICY: User ${user.email} has role ${user.role} but is missing required questionnaire fields`);
      
      // Update the user's role to pending to force them to complete the profile
      await conn.db.collection('users').updateOne(
        { email: user.email },
        { 
          $set: { 
            role: 'pending',
            registrationCompleted: false,
            forcedProfileCompletion: true, // Add this flag to track forced redirections
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`STRICT ENFORCEMENT: Updated user ${user.email} role to pending to force profile completion`);
      
      // Override the check result to ensure we report incomplete status with strong redirection
      return NextResponse.json({ 
        isComplete: false,
        forceRedirect: true,
        isCritical: true,
        message: "Profile completion required",
        redirectTo: "/auth/complete-profile?forced=true&from=api"
      });
    }
    
    // Check for inconsistency: user has completed profile but still has pending role
    if (hasRequiredFields && hasStoredResponse && user.role === 'pending') {
      console.log(`CONSISTENCY FIX: User ${user.email} has completed profile but still has pending role`);
      
      // Fix the role to be waiting_list
      await conn.db.collection('users').updateOne(
        { email: user.email },
        { 
          $set: { 
            role: 'waiting_list',
            registrationCompleted: true,
            roleFixedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`Role consistency fixed for ${user.email}: set to waiting_list`);
    }

    return NextResponse.json({ isComplete });
    } catch (dbError: any) {
      console.error("Database connection error:", dbError);
      
      // Handle MongoDB connection errors specifically
      if (dbError.code === 'ECONNREFUSED' || 
          dbError.code === 'ENOTFOUND' || 
          dbError.message?.includes('querySrv') ||
          dbError.message?.includes('Could not connect to any servers')) {
        
        // Return a specific database connection error
        return NextResponse.json({ 
          error: "Database connection failed",
          message: "Unable to connect to the database. This may be temporary.",
          code: dbError.code || "CONNECTION_ERROR",
          isComplete: false,
          dbConnectionError: true
        }, { status: 503 }); // 503 Service Unavailable
      }
      
      // For other database errors, still return a 500
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error checking profile completion:", error);
    return NextResponse.json({ 
      error: "Failed to check profile completion",
      message: error.message || "Unknown error occurred",
      isComplete: false
    }, { status: 500 });
  }
}