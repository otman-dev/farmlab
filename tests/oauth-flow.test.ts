// This is a test file to verify our Google OAuth integration

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../src/app/api/auth/[...nextauth]';

// Mock Next.js request/response
const createMockRequestResponse = () => {
  const req = {
    headers: {
      'content-type': 'application/json',
    },
    body: {},
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return { req, res };
};

// Mock getServerSession
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

// Mock mongodb-cloud connection
vi.mock('../src/lib/mongodb-cloud', () => ({
  getCloudConnection: vi.fn().mockResolvedValue({
    db: {
      collection: vi.fn().mockReturnValue({
        findOne: vi.fn(),
        insertOne: vi.fn(),
        updateOne: vi.fn(),
      }),
    },
  }),
}));

describe('OAuth Authentication Flow', () => {
  beforeAll(() => {
    // Mock environment variables
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should redirect new Google users to complete profile', async () => {
    const { getCloudConnection } = await import('../src/lib/mongodb-cloud');
    
    // Mock database response for a new user
    const mockCollection = {
      findOne: vi.fn().mockResolvedValue(null), // User doesn't exist yet
      insertOne: vi.fn().mockResolvedValue({ acknowledged: true }),
    };
    
    (getCloudConnection as any).mockResolvedValue({
      db: {
        collection: vi.fn().mockReturnValue(mockCollection),
      },
    });

    // Test the signIn callback
    const result = await authOptions.callbacks.signIn({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/image.jpg',
      },
      account: {
        provider: 'google',
      },
    });

    // Should redirect to complete-profile
    expect(result).toBe('/auth/complete-profile');
    expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test User',
      email: 'test@example.com',
      role: 'waiting_list',
      registrationCompleted: false,
    }));
  });

  it('should allow existing users with complete profiles to sign in', async () => {
    const { getCloudConnection } = await import('../src/lib/mongodb-cloud');
    
    // Mock database response for existing user
    const mockCollection = {
      findOne: vi.fn().mockResolvedValue({
        _id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'visitor',
        registrationCompleted: true,
      }),
    };
    
    (getCloudConnection as any).mockResolvedValue({
      db: {
        collection: vi.fn().mockReturnValue(mockCollection),
      },
    });

    // Test the signIn callback
    const result = await authOptions.callbacks.signIn({
      user: {
        name: 'Test User',
        email: 'test@example.com',
      },
      account: {
        provider: 'google',
      },
    });

    // Should allow sign in
    expect(result).toBe(true);
  });
});