"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiInfo, FiStar, FiMail } from 'react-icons/fi';

interface VisitorNavigationProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function VisitorNavigation({ mobileOpen, setMobileOpen }: VisitorNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { path: '/visitorDashboard', label: 'Home', icon: FiHome },
    { path: '/visitorDashboard/features', label: 'Features', icon: FiStar },
    { path: '/visitorDashboard/about', label: 'About', icon: FiInfo },
    { path: '/visitorDashboard/contact', label: 'Contact', icon: FiMail },
  ];

  // Sidebar content as a component for reuse
  const SidebarContent = (
    <div className="flex flex-col h-full w-full px-4 pt-8 pb-4 overflow-y-auto">
      {/* Logo/Header */}
      <div className="mb-6 w-full flex items-center">
        <h1 className="text-2xl font-bold text-green-600 tracking-tight pl-2">FarmLab Dashboard</h1>
      </div>
      {/* Nav links */}
      <nav className="flex flex-col gap-2 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.path ||
            (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3 text-base font-medium rounded-lg transition-colors duration-150 ${
                isActive
                  ? 'bg-green-100 text-green-700 shadow'
                  : 'text-gray-700 hover:bg-green-50 hover:text-green-800'
              }`}
              style={{ minHeight: 48 }}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* Spacer to push sign out to bottom on tall screens */}
      <div className="flex-1" />
      {/* Sign out */}
      <div className="w-full flex items-center">
        <Link
          href="/api/auth/signout"
          className="text-base text-red-500 hover:text-red-700 font-semibold px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors duration-150 w-full text-left"
          onClick={() => setMobileOpen(false)}
        >
          Sign out
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        {/* Sidebar drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 z-50 flex flex-col ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 p-2 rounded bg-gray-100 hover:bg-gray-200 focus:outline-none z-50"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1 flex flex-col justify-center items-center w-full">
            {SidebarContent}
          </div>
        </div>
        {/* Overlay only covers area outside sidebar */}
        {/* No overlay needed, sidebar covers all */}
      </div>

      {/* Desktop sidebar */}
      <div className="h-full w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        {SidebarContent}
      </div>
    </>
  );
}