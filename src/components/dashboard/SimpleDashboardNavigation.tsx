
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiServer, FiActivity, FiLock, FiSettings } from 'react-icons/fi';
import { useEffect, useState } from 'react';

type Props = {
  onNavigate?: () => void;
  mobile?: boolean;
};

export default function SimpleDashboardNavigation({ onNavigate, mobile }: Props) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
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
    ...(role === 'admin' ? [{ path: '/dashboard/users', label: 'User Management', icon: FiLock }] : []),
    { path: '/dashboard/settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <div
      className={`${mobile ? 'w-full h-[100vh]' : 'w-64 h-full'} bg-white border-r border-gray-200 flex flex-col ${mobile ? 'shadow-xl' : 'md:relative fixed z-50 md:z-auto md:static top-0 left-0 md:translate-x-0 md:block'}`}
    >
      {/* Only show title on desktop, handled in drawer for mobile */}
      {!mobile && (
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-green-600">FarmLab Dashboard</h1>
        </div>
      )}
  <nav className={`${mobile ? 'px-6 py-8' : 'px-4 py-6'} space-y-2`}>
    {navItems.map((item) => {
      const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`));
      const Icon = item.icon;
      return (
        <Link
          key={item.path}
          href={item.path}
          className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-150 ${
            isActive
              ? 'bg-green-100 text-green-700'
              : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
          }`}
          onClick={onNavigate}
        >
          <Icon className={`mr-4 h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
          {item.label}
        </Link>
      );
    })}
    <Link
      href="/api/auth/signout"
      className="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-150 text-red-500 hover:text-red-700 mt-4"
      onClick={onNavigate}
    >
      <span className="mr-4 h-5 w-5">🔒</span>
      Sign out
    </Link>
  </nav>
    </div>
  );
}