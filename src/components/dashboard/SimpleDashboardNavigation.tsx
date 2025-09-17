
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiServer, FiActivity, FiLock, FiSettings } from 'react-icons/fi';
import { useEffect, useState } from 'react';

export default function SimpleDashboardNavigation() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Try to get user role from localStorage (set by layout)
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('user_role'));
    }
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/dashboard/devices', label: 'Devices', icon: FiServer },
    { path: '/dashboard/sensorstations', label: 'Sensor Stations', icon: FiActivity },
    { path: '/dashboard/securitysystem', label: 'Security System', icon: FiLock },
    { path: '/dashboard/services', label: 'Services Status', icon: FiServer },
    // Only show User Management for admin
    ...(role === 'admin' ? [{ path: '/dashboard/users', label: 'User Management', icon: FiLock }] : []),
    { path: '/dashboard/settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-green-600">FarmLab Dashboard</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          // Check if the current path is the item path or starts with the item path + '/'
          const isActive = pathname === item.path || 
                          (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="text-sm text-gray-500">
            <Link 
              href="/api/auth/signout"
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Sign out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}