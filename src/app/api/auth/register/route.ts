
import { NextRequest, NextResponse } from "next/server";
import { getCloudConnection } from "@/lib/mongodb-cloud";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // For direct API requests from the regular registration form,
    // we want to create a pending user that must complete the multistep registration
    const body = await request.json();
    console.log("Registration request received:", { ...body, password: '[REDACTED]' });
    
    // If user is already authenticated with OAuth and completing their profile
    if (body.googleAuthenticated) {
      console.log('OAuth user completing profile - processing normally');
    } else {
      console.log('Direct registration attempt - will create pending user that must complete the multistep form');
    }
    
    const { 
      email, 
      password, 
      full_name,
      phone,
      role, 
      organization,
      experience_level,
      farm_size,
      research_field,
      interest_reason,
      roles, // Add roles array
      ...otherFields // Capture all other fields
    } = body;
    
    // Validate required fields with better error messaging
    console.log('Validation check:', { email: !!email, password: !!password, full_name: !!full_name, role: !!role, roles: roles });
    
    if (!email || !password || !full_name) {
      return NextResponse.json({ 
        error: 'Email, password, and full name are required' 
      }, { status: 400 });
    }

    // Handle role field - derive from roles array if role is missing
    let userRole = role;
    if (!userRole) {
      if (Array.isArray(roles) && roles.length > 0) {
        userRole = 'waiting_list'; // Always use waiting_list for new users
        console.log('Derived role from roles array, setting to waiting_list');
      } else {
        userRole = 'waiting_list'; // Default role
        console.log('Using default role: waiting_list');
      }
    }

    // Connect to database with retry logic
    let conn;
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        conn = await getCloudConnection();
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.error(`MongoDB connection attempt ${retryCount} failed:`, error);
        
        if (retryCount >= maxRetries) {
          console.error('All MongoDB connection attempts failed. Registration cannot proceed.');
          return NextResponse.json({
            error: "Service temporarily unavailable. Please try again later."
          }, { status: 503 });
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
    
    // Check if user already exists using direct connection
    const existingUser = await conn.db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });
    if (existingUser) {
      return NextResponse.json({ 
        error: 'A user with this email already exists' 
      }, { status: 409 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with pending role so they must complete multistep registration
    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: full_name,
      phone: phone || '',
      role: 'pending', // Force pending role to require multistep registration completion
      registrationCompleted: false, // Mark as incomplete
      googleAuthenticated: false, // This is a regular email registration
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userResult = await conn.db.collection('users').insertOne(userData);
    const userId = userResult.insertedId;
    console.log("User created successfully:", { userId, email });

    // Create registration response record with all form data
    const registrationData = {
      userId: userId,
      email: email.toLowerCase(),
      full_name,
      phone: phone || '',
      intended_role: roles ? roles[0] : 'waiting_list', // User's primary intended role
      organization: organization || '',
      country: body.country || '',
      experience_level: experience_level || '',
      farm_size: farm_size || '',
      research_field: research_field || '',
      interest_reason: interest_reason || '',
      
      // Store all the detailed form responses
      roles: roles || [],
      ...otherFields, // Include all other form fields
      
      submitted_at: new Date(),
    };

    const responseResult = await conn.db.collection('registrationresponses').insertOne(registrationData);
    const responseId = responseResult.insertedId;
    
    console.log("Registration response saved:", { responseId });

    return NextResponse.json({
      message: "Registration started! Please complete your profile to continue.",
      userId: userId,
      responseId: responseId,
      redirectTo: "/auth/complete-profile"
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({ 
          error: 'A user with this email already exists' 
        }, { status: 409 });
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json({ 
          error: 'Please check your input and try again' 
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      error: "Registration failed. Please try again later."
    }, { status: 500 });
  }
}
