import { NextRequest, NextResponse } from 'next/server';
import { getCloudConnection } from '@/lib/mongodb-cloud';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const conn = await getCloudConnection();
    const rolesCollection = conn.db.collection('roles');
    const roles = await rolesCollection.find({}).toArray();
    
    console.log('Fetched roles from cloud database:', roles.length);
    
    // Serialize roles
    const serializedRoles = roles.map(role => ({
      _id: role._id.toString(),
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
      createdAt: role.createdAt || new Date().toISOString()
    }));
    
    return NextResponse.json({ roles: serializedRoles });
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

    const conn = await getCloudConnection();
    const rolesCollection = conn.db.collection('roles');

    // Check for existing role with same name
    const existingRole = await rolesCollection.findOne({ name });
    if (existingRole) {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 400 });
    }

    // Create new role
    const newRole = {
      name,
      description,
      permissions: permissions || [],
      createdAt: new Date().toISOString()
    };
    
    const result = await rolesCollection.insertOne(newRole);
    const createdRole = await rolesCollection.findOne({ _id: result.insertedId });
    
    const serializedRole = {
      _id: createdRole!._id.toString(),
      name: createdRole!.name,
      description: createdRole!.description,
      permissions: createdRole!.permissions,
      createdAt: createdRole!.createdAt
    };

    return NextResponse.json({ role: serializedRole }, { status: 201 });
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

    const conn = await getCloudConnection();
    const rolesCollection = conn.db.collection('roles');

    // Update role using string ID
    const result = await rolesCollection.updateOne(
      { _id: _id },
      { 
        $set: { 
          name, 
          description, 
          permissions: permissions || [] 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const updatedRole = await rolesCollection.findOne({ _id: _id });
    if (!updatedRole) {
      return NextResponse.json({ error: 'Role not found after update' }, { status: 404 });
    }

    const serializedRole = {
      _id: updatedRole._id.toString(),
      name: updatedRole.name,
      description: updatedRole.description,
      permissions: updatedRole.permissions || [],
      createdAt: updatedRole.createdAt || new Date().toISOString()
    };

    return NextResponse.json({ role: serializedRole });
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

    const conn = await getCloudConnection();
    const rolesCollection = conn.db.collection('roles');

    // Delete role using string ID
    const result = await rolesCollection.deleteOne({ _id: _id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}