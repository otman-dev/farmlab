

import { NextResponse } from 'next/server';
import { getCloudUserModel } from '@/lib/mongodb-cloud';
import bcrypt from 'bcryptjs';

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
  // Hash password before saving (mimic registration flow)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = await UserModel.create({ name, email, password: hashedPassword, role });
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
    const update: Partial<{ name: string; email: string; role: string; password?: string }> = { name, email, role };
    if (password) {
  const salt = await bcrypt.genSalt(10);
  update.password = await bcrypt.hash(password, salt);
    }
    const updated = await UserModel.findByIdAndUpdate(_id, update, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
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
