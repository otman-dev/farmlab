

import { NextResponse } from 'next/server';
import { getCloudUserModel } from '@/lib/mongodb-cloud';

export async function GET() {
  try {
    const UserModel = await getCloudUserModel();
    const users = await UserModel.find({}, '-password').lean();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const UserModel = await getCloudUserModel();
    const body = await request.json();
    const { name, email, password, role } = body;
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Check if user already exists
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    // Let the User model handle password hashing via pre('save') middleware
    const newUser = await UserModel.create({ name, email, password, role });
    return NextResponse.json({ user: { ...newUser.toObject(), password: undefined } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const UserModel = await getCloudUserModel();
    const body = await request.json();
    const { _id, name, email, role, password } = body;
    if (!_id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }
    
    // Find the user first
    const user = await UserModel.findById(_id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update fields
    user.name = name;
    user.email = email;
    user.role = role;
    if (password) {
      // Set password - pre('save') middleware will handle hashing
      user.password = password;
    }
    
    // Save user (triggers pre('save') middleware for password hashing)
    const updated = await user.save();
    
    return NextResponse.json({ user: { ...updated.toObject(), password: undefined } });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const UserModel = await getCloudUserModel();
    const body = await request.json();
    const { _id } = body;
    if (!_id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }
    const deleted = await UserModel.findByIdAndDelete(_id);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
