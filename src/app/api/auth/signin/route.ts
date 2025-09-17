
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import mongoose, { Model } from 'mongoose';
import UserModel from '@/models/User';
import jwt from 'jsonwebtoken';

// Explicitly type the UserModel
interface User {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
}

// Explicitly type the UserModel export
const TypedUserModel: Model<User> = UserModel as unknown as Model<User>;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Connect to the database
    await dbConnect();


    // Find the user
    const user = await TypedUserModel.findOne({ email }).select('+password');
    if (!user) {
      console.log('No user found for email:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Debug: print entered password and stored hash
    console.log('Entered password:', password);
    console.log('Stored hash:', user.password);

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('bcrypt.compare result:', isMatch);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token (include role)
    const secret = process.env.JWT_SECRET || 'vercel_secret';
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    // Set cookie
    const response = NextResponse.json({ message: 'Sign-in successful', user: { id: user._id, name: user.name, email: user.email } }, { status: 200 });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (error) {
    console.error('Error during sign-in:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}