import { NextRequest, NextResponse } from 'next/server';

// Mock API route for build purposes

// Define the role interface
interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

// Mock data
const mockRoles: Role[] = [
  {
    _id: 'role1',
    name: 'Administrator',
    description: 'Full access to all system features',
    permissions: ['manage_users', 'manage_animals', 'view_reports', 'edit_settings'],
    createdAt: '2025-09-15T00:00:00Z'
  },
  {
    _id: 'role2',
    name: 'Farm Manager',
    description: 'Day-to-day farm operations management',
    permissions: ['manage_animals', 'view_reports'],
    createdAt: '2025-09-16T00:00:00Z'
  },
  {
    _id: 'role3',
    name: 'Veterinarian',
    description: 'Access to animal health records',
    permissions: ['view_animals', 'edit_health_records'],
    createdAt: '2025-09-17T00:00:00Z'
  }
];

export async function GET() {
  try {
    return NextResponse.json({ roles: mockRoles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, permissions } = await request.json();

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    // Check for existing role with same name
    const existingRole = mockRoles.find(role => role.name === name);
    if (existingRole) {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 400 });
    }

    // Create new role
    const newRole: Role = {
      _id: `role_${Date.now()}`,
      name,
      description,
      permissions: permissions || [],
      createdAt: new Date().toISOString()
    };
    
    // Add to mock data
    mockRoles.push(newRole);

    return NextResponse.json({ role: newRole }, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { _id, name, description, permissions } = await request.json();

    if (!_id || !name || !description) {
      return NextResponse.json({ error: 'ID, name and description are required' }, { status: 400 });
    }

    // Find role to update
    const roleIndex = mockRoles.findIndex(role => role._id === _id);
    if (roleIndex === -1) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Update role
    mockRoles[roleIndex] = {
      ...mockRoles[roleIndex],
      name,
      description,
      permissions: permissions || []
    };

    return NextResponse.json({ role: mockRoles[roleIndex] });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { _id } = await request.json();

    if (!_id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    // Find role to delete
    const roleIndex = mockRoles.findIndex(role => role._id === _id);
    if (roleIndex === -1) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Remove role from mock data
    mockRoles.splice(roleIndex, 1);

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}