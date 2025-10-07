"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  FiHome, 
  FiServer, 
  FiActivity, 
  FiLock, 
  FiSettings, 
  FiUsers, 
  FiBarChart, 
  FiPackage, 
  FiShoppingCart, 
  FiInfo, 
  FiStar, 
  FiMail,
  FiChevronDown,
  FiChevronRight,
  FiShield,
  FiTrendingUp,
  FiUserCheck,
  FiEye
} from 'react-icons/fi';

interface AdminNavigationProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function AdminNavigation({ mobileOpen, setMobileOpen }: AdminNavigationProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    admin: true,
    manager: false,
    sponsor: false,
    visitor: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Admin-only sections
  const adminNavItems = [
    { path: '/adminDashboard', label: 'Admin Dashboard', icon: FiShield },
    { path: '/dashboard/todolist', label: 'Todo List', icon: FiActivity },
    { path: '/dashboard/devices', label: 'Devices', icon: FiServer },
    { path: '/dashboard/sensorstations', label: 'Sensor Stations', icon: FiActivity },
    { path: '/dashboard/securitysystem', label: 'Security System', icon: FiLock },
    { path: '/dashboard/services', label: 'Services Status', icon: FiServer },
    { path: '/dashboard/users', label: 'User Management', icon: FiUsers },
    { path: '/dashboard/settings', label: 'Admin Settings', icon: FiSettings },
  ];

  // Manager dashboard items
  const managerNavItems = [
    { path: '/managerDashboard', label: 'Manager Dashboard', icon: FiTrendingUp },
    { path: '/managerDashboard/medical-stock', label: 'Medical Stock', icon: FiActivity },
    { path: '/managerDashboard/food-stock', label: 'Food Stock', icon: FiActivity },
    { path: '/managerDashboard/plant-stock', label: 'Plant Stock', icon: FiActivity },
    { path: '/managerDashboard/staff', label: 'Staff Management', icon: FiUserCheck },
    { path: '/managerDashboard/invoices', label: 'Invoices & Receipts', icon: FiServer },
    { path: '/managerDashboard/products', label: 'Products', icon: FiServer },
    { path: '/managerDashboard/suppliers', label: 'Suppliers', icon: FiServer },
  ];

  // Sponsor dashboard items
  const sponsorNavItems = [
    { path: '/sponsorDashboard', label: 'Sponsor Dashboard', icon: FiHome },
    { path: '/sponsorDashboard/analytics', label: 'Analytics & Insights', icon: FiBarChart },
    { path: '/sponsorDashboard/inventory', label: 'Inventory & Stock', icon: FiPackage },
    { path: '/sponsorDashboard/financial', label: 'Financial Tracking', icon: FiShoppingCart },
    { path: '/sponsorDashboard/settings', label: 'Sponsor Settings', icon: FiSettings },
  ];

  // Visitor dashboard items
  const visitorNavItems = [
    { path: '/visitorDashboard', label: 'Visitor Dashboard', icon: FiEye },
    { path: '/visitorDashboard/features', label: 'Features', icon: FiStar },
    { path: '/visitorDashboard/about', label: 'About', icon: FiInfo },
    { path: '/visitorDashboard/contact', label: 'Contact', icon: FiMail },
  ];

  const renderNavSection = (
    title: string,
    sectionKey: string,
    items: Array<{ path: string; label: string; icon: any }>,
    badgeColor: string
  ) => {
    const isExpanded = expandedSections[sectionKey];
    const ChevronIcon = isExpanded ? FiChevronDown : FiChevronRight;

    return (
      <div className="mb-4">
        {/* Section Header */}
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors duration-150"
        >
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded-full text-white ${badgeColor}`}>
              {title.charAt(0).toUpperCase()}
            </span>
            <span>{title} Dashboard</span>
          </div>
          <ChevronIcon className="h-4 w-4" />
        </button>

        {/* Section Items */}
        {isExpanded && (
          <div className="ml-3 mt-2 space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.path || 
                (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    isActive
                      ? 'bg-green-100 text-green-700 shadow-sm'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-800'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Sidebar content as a component for reuse
  const SidebarContent = (
    <div className="flex flex-col h-full w-full px-4 pt-6 pb-4 overflow-y-auto">
      {/* Logo/Header */}
      <div className="mb-6 w-full flex items-center">
        <div className="flex items-center gap-2">
          <FiShield className="h-6 w-6 text-red-600" />
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Admin Console</h1>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-xs text-red-700 font-medium">
          🔒 Administrator Access - All Role Dashboards
        </p>
      </div>

      {/* Navigation Sections */}
      <nav className="flex flex-col gap-1 w-full">
        {renderNavSection('Admin', 'admin', adminNavItems, 'bg-red-600')}
        {renderNavSection('Manager', 'manager', managerNavItems, 'bg-blue-600')}
        {renderNavSection('Sponsor', 'sponsor', sponsorNavItems, 'bg-purple-600')}
        {renderNavSection('Visitor', 'visitor', visitorNavItems, 'bg-green-600')}
      </nav>

      {/* Spacer to push sign out to bottom */}
      <div className="flex-1" />
      
      {/* Sign out */}
      <div className="w-full flex items-center mt-4">
        <Link 
          href="/api/auth/signout"
          className="text-sm text-red-500 hover:text-red-700 font-semibold px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors duration-150 w-full text-left flex items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <FiLock className="h-4 w-4" />
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
      </div>

      {/* Desktop sidebar */}
      <div className="h-full w-72 bg-white border-r border-gray-200 hidden md:flex flex-col">
        {SidebarContent}
      </div>
    </>
  );
}