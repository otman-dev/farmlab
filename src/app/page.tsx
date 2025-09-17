"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Custom session handling logic
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='));

    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signin');
    }
  }, [router]);

  // Show a simple loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Farm IoT Dashboard</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
