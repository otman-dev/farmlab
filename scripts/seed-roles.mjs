import Role from '../src/models/Role.cloud.js';
import clientPromise from '../src/lib/mongodb-client.js';

async function seedRoles() {
  try {
    await clientPromise;
    console.log('Seeding roles...');

    const roles = [
      { name: 'admin', description: 'Administrator with full access', permissions: ['read', 'write', 'delete', 'manage_users'] },
      { name: 'visitor', description: 'Basic user with limited access to presentation dashboard', permissions: ['read'] },
      { name: 'waiting_list', description: 'Users on waiting list, access coming soon page', permissions: [] },
    ];

    for (const roleData of roles) {
      const existing = await Role.findOne({ name: roleData.name });
      if (!existing) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.name}`);
      } else {
        console.log(`Role ${roleData.name} already exists`);
      }
    }

    console.log('Roles seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();