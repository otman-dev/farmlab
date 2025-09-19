import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const users = await UserModel.find({}, '-password').lean();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Create a new user
export async function POST(request: Request) {
  try {
    await dbConnect();
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
    const newUser = await UserModel.create({ name, email, password, role });
    return NextResponse.json({ user: { ...newUser.toObject(), password: undefined } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// Update a user (expects _id in body)
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, name, email, role, password } = body;
    if (!_id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }
    const update: Partial<{ name: string; email: string; role: string; password?: string }> = { name, email, role };
    if (password) update.password = password;
    const updated = await UserModel.findByIdAndUpdate(_id, update, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user: { ...updated.toObject(), password: undefined } });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// Delete a user (expects _id in body)
export async function DELETE(request: Request) {
  try {
    await dbConnect();
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
