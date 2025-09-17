/* eslint-disable @typescript-eslint/no-require-imports */
// Temporarily disable the rule for this file to allow the build to proceed.

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose, { Model } from "mongoose";

// Get the typed User model to avoid TypeScript errors
type UserDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
};

// Import the User model dynamically to avoid circular imports
// and explicitly cast it to the correct type
const getUserModel = (): Model<UserDocument> => {
  const UserModel = require('@/models/User').default;
  return UserModel as Model<UserDocument>;
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Connect to the database
    await dbConnect();

    // Get the User model
    const User = getUserModel();

    // Log connection details
    console.log("Connected to database:", mongoose.connection.db?.databaseName || 'unknown');

    // Ensure users collection exists using the native driver directly
    try {
      if (mongoose.connection.db) {
        console.log(`Using database: ${mongoose.connection.db.databaseName}`);

        const collections = await mongoose.connection.db.listCollections().toArray();
        const userCollectionExists = collections.some(c => c.name === 'users');

        if (!userCollectionExists) {
          console.log("Users collection doesn't exist, creating it now");
          await mongoose.connection.db.createCollection('users');
          console.log("Users collection created successfully");
        } else {
          console.log("Users collection already exists");
        }
      } else {
        console.log("Could not access database object");
      }
    } catch (collectionError) {
      console.error("Error checking/creating users collection:", collectionError);
      // Continue with registration attempt anyway
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user (let pre-save hook hash the password)
    console.log("Creating new user with email:", email);
    const user = await User.create({
      name,
      email,
      password,
      role: "visitor", // Default role is now visitor
    });
    console.log("User created successfully with ID:", user._id);

    // Don't send the password back
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(
      { message: "User registered successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Add detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    // More specific error messages based on the error type
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { message: "Validation error: " + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error registering user" },
      { status: 500 }
    );
  }
}