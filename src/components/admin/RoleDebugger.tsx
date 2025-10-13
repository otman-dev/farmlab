'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type UserRoleData = {
  session: {
    exists: boolean;
    email: string | null;
    name: string | null;
    role: string | null;
    image: string | null;
  };
  token: {
    exists: boolean;
    email: string | null;
    name: string | null;
    role: string | null;
    sub: string | null;
  };
  database: {
    userFound: boolean;
    role: string | null;
    email: string | null;
    googleAuthenticated: boolean;
    registrationCompleted: boolean;
  };
  consistency: {
    sessionMatchesToken: boolean;
    sessionMatchesDb: boolean;
    tokenMatchesDb: boolean;
    allMatch: boolean;
  };
};

export default function AdminRoleDebugger() {
  const { data: session, status } = useSession();
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Check admin status separately without early return
  useEffect(() => {
    if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      setIsAdmin(userRole === 'admin');
    } else if (status === 'unauthenticated') {
      setIsAdmin(false);
    }
  }, [status, session]);
  
  const fetchRoleData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/debug/user-role');
      if (!response.ok) {
        throw new Error('Failed to fetch role data');
      }
      const data = await response.json();
      setRoleData(data);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fixRoleFromDatabase = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/debug/user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'sync_role_from_db' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fix role');
      }
      
      const data = await response.json();
      setMessage(`Success: ${data.message}`);
      
      // Fetch updated data
      setTimeout(fetchRoleData, 1000);
      
      // Reload the page after a short delay to apply the fix
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch role data when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRoleData();
    }
  }, [status]);
  
  if (status === 'loading' || isAdmin === null) {
    return <div className="p-4 text-gray-700">Loading session...</div>;
  }
  
  if (status === 'unauthenticated' || isAdmin === false) {
    return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
      {status === 'unauthenticated' ? 'You must be signed in to use this tool' : 'Admin access required'}
    </div>;
  }
  
  return (
    <div className="p-4 bg-white rounded shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">User Role Debugger</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.startsWith('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message}
        </div>
      )}
      
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={fetchRoleData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
        
        <button 
          onClick={fixRoleFromDatabase}
          disabled={loading || !roleData || roleData.consistency.allMatch}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
        >
          Apply Role Fix
        </button>
      </div>
      
      {roleData && (
        <div className="space-y-6">
          <div className={`p-3 rounded ${roleData.consistency.allMatch ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <h3 className="font-bold text-lg">Consistency Check</h3>
            <p>All roles match: {roleData.consistency.allMatch ? '✓ Yes' : '✗ No'}</p>
            <p>Session matches Token: {roleData.consistency.sessionMatchesToken ? '✓ Yes' : '✗ No'}</p>
            <p>Session matches Database: {roleData.consistency.sessionMatchesDb ? '✓ Yes' : '✗ No'}</p>
            <p>Token matches Database: {roleData.consistency.tokenMatchesDb ? '✓ Yes' : '✗ No'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-100 rounded">
              <h3 className="font-bold text-lg">Session</h3>
              <p>Exists: {roleData.session.exists ? '✓ Yes' : '✗ No'}</p>
              <p>Email: {roleData.session.email || 'Not set'}</p>
              <p>Name: {roleData.session.name || 'Not set'}</p>
              <p>Role: {roleData.session.role || 'Not set'}</p>
              <p>Has Image: {roleData.session.image ? '✓ Yes' : '✗ No'}</p>
            </div>
            
            <div className="p-3 bg-gray-100 rounded">
              <h3 className="font-bold text-lg">JWT Token</h3>
              <p>Exists: {roleData.token.exists ? '✓ Yes' : '✗ No'}</p>
              <p>Email: {roleData.token.email || 'Not set'}</p>
              <p>Name: {roleData.token.name || 'Not set'}</p>
              <p>Role: {roleData.token.role || 'Not set'}</p>
              <p>Subject: {roleData.token.sub || 'Not set'}</p>
            </div>
            
            <div className="p-3 bg-gray-100 rounded">
              <h3 className="font-bold text-lg">Database</h3>
              <p>User Found: {roleData.database.userFound ? '✓ Yes' : '✗ No'}</p>
              <p>Email: {roleData.database.email || 'Not set'}</p>
              <p>Role: {roleData.database.role || 'Not set'}</p>
              <p>OAuth User: {roleData.database.googleAuthenticated ? '✓ Yes' : '✗ No'}</p>
              <p>Registration Complete: {roleData.database.registrationCompleted ? '✓ Yes' : '✗ No'}</p>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded">
            <h3 className="font-bold text-lg">How to fix role issues</h3>
            <p className="mb-2">If the roles don&apos;t match, click the &quot;Apply Role Fix&quot; button above to create a temporary bypass cookie that will allow your session to refresh with the correct role from the database.</p>
            <p>After clicking the button, you will be redirected to your dashboard with the correct role.</p>
          </div>
        </div>
      )}
      
      {!roleData && !loading && (
        <div className="p-4 bg-gray-100 rounded">
          No data available. Click &quot;Refresh Data&quot; to load role information.
        </div>
      )}
      
      {loading && (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}
    </div>
  );
}