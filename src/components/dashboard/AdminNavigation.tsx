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
  FiEye,
  FiCheck
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
    'manager-stock': true,
    'manager-business': false,
    'manager-personnel': false,
    'manager-hydroponics': false,
    'plant-cycles': false,
    'animal-cycles': false,
    sponsor: false,
    visitor: false,
    'user-views': false,
    'developer-tools': false,
    'system-pages': false
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
    { path: '/adminDashboard/microclimate', label: 'Microclimate Metrics', icon: FiTrendingUp },
    { path: '/adminDashboard/debug', label: 'Debug Tools', icon: FiActivity },
    { path: '/dashboard/todolist', label: 'Todo List', icon: FiActivity },
    { path: '/dashboard/devices', label: 'Devices', icon: FiServer },
    { path: '/dashboard/sensorstations', label: 'Sensor Stations', icon: FiActivity },
    { path: '/dashboard/securitysystem', label: 'Security System', icon: FiLock },
    { path: '/dashboard/services', label: 'Services Status', icon: FiServer },
    { path: '/dashboard/users', label: 'User Management', icon: FiUsers },
    { path: '/dashboard/waitlist', label: 'Waiting List', icon: FiUserCheck },
    { path: '/dashboard/unassigned-users', label: 'Unassigned Users', icon: FiUsers },
    { path: '/dashboard/settings', label: 'Admin Settings', icon: FiSettings },
  ];

  // Manager dashboard items (grouped)
  const managerMainItems = [
    { path: '/managerDashboard', label: 'Manager Dashboard', icon: FiTrendingUp },
  ];

  const managerStockItems = [
    { path: '/managerDashboard/medical-stock', label: 'Medical Stock', icon: FiActivity },
    { path: '/managerDashboard/food-stock', label: 'Food Stock', icon: FiActivity },
    { path: '/managerDashboard/plant-stock', label: 'Plant Stock', icon: FiActivity },
  ];

  const managerBusinessItems = [
    { path: '/managerDashboard/products', label: 'Products', icon: FiServer },
    { path: '/managerDashboard/suppliers', label: 'Suppliers', icon: FiServer },
    { path: '/managerDashboard/invoices', label: 'Invoices & Receipts', icon: FiServer },
  ];

  const managerPersonnelItems = [
    { path: '/managerDashboard/staff', label: 'Staff Management', icon: FiUserCheck },
  ];

  const managerHydroponicsItems = [
    { path: '/managerDashboard/hydroponic-barley', label: 'Hydroponic Barley Cycles', icon: FiActivity },
  ];

  // Development sections - moved to admin for development
  const plantCyclesItems = [
    { path: '/managerDashboard/plant-cycles', label: 'Plant Growth Cycles', icon: FiActivity },
    { path: '/managerDashboard/planting-schedule', label: 'Planting Schedule', icon: FiServer },
    { path: '/managerDashboard/harvest-tracker', label: 'Harvest Tracker', icon: FiActivity },
    { path: '/managerDashboard/crop-rotation', label: 'Crop Rotation', icon: FiServer },
  ];

  const animalCyclesItems = [
    { path: '/managerDashboard/animal-cycles', label: 'Animal Life Cycles', icon: FiActivity },
    { path: '/managerDashboard/breeding-schedule', label: 'Breeding Schedule', icon: FiServer },
    { path: '/managerDashboard/health-monitoring', label: 'Health Monitoring', icon: FiActivity },
    { path: '/managerDashboard/feeding-schedule', label: 'Feeding Schedule', icon: FiServer },
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

  // User view debugging - what different user types see
  const userViewItems = [
    { path: '/dashboard/preview/home', label: 'Home Page (Public)', icon: FiHome },
    { path: '/dashboard/preview/comingsoon', label: 'Coming Soon (Waitlist View)', icon: FiUsers },
    { path: '/dashboard/preview/register', label: 'Registration Flow', icon: FiUserCheck },
    { path: '/dashboard/preview/signin', label: 'Sign In Page', icon: FiLock },
    { path: '/dashboard/preview/thankyou', label: 'Thank You Page', icon: FiCheck },
    { path: '/dashboard/preview/contact', label: 'Public Contact Page', icon: FiMail },
  ];

  // Developer tools and system management
  const developerToolsItems = [
    { path: '/test-loading', label: 'Loading Test Page', icon: FiActivity },
    { path: '/auth/error', label: 'Auth Error Page', icon: FiShield },
    { path: '/adminDashboard', label: 'Legacy Admin Dashboard', icon: FiServer },
    { path: '/dashboard/todolist', label: 'Todo List Management', icon: FiCheck },
  ];

  // System and standalone pages
  const systemPagesItems = [
    { path: '/comingsoon', label: 'Coming Soon (Direct)', icon: FiUsers },
    { path: '/auth/register', label: 'Registration (Direct)', icon: FiUserCheck },
    { path: '/auth/signin', label: 'Sign In (Direct)', icon: FiLock },
    { path: '/thankyou', label: 'Thank You (Direct)', icon: FiCheck },
    { path: '/contact', label: 'Contact (Direct)', icon: FiMail },
    { path: '/', label: 'Home (Direct)', icon: FiHome },
  ];

  const renderNavSection = (
    title: string,
    sectionKey: string,
    items: Array<{ path: string; label: string; icon: any }>,
    badgeColor: string,
    isSubsection: boolean = false
  ) => {
    const isExpanded = expandedSections[sectionKey];
    const ChevronIcon = isExpanded ? FiChevronDown : FiChevronRight;

    return (
      <div className={isSubsection ? "ml-4 mb-2" : "mb-4"}>
        {/* Section Header */}
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors duration-150 ${isSubsection ? 'text-xs' : ''}`}
        >
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded-full text-white ${badgeColor}`}>
              {title.charAt(0).toUpperCase()}
            </span>
            <span>{title}</span>
          </div>
          <ChevronIcon className="h-4 w-4" />
        </button>

        {/* Section Items */}
        {isExpanded && (
          <div className={`${isSubsection ? 'ml-3' : 'ml-3'} mt-2 space-y-1`}>
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

  const renderManagerSection = () => {
    const isManagerExpanded = expandedSections['manager'];
    
    return (
      <div className="mb-4">
        {/* Manager Main Section */}
        <button
          onClick={() => toggleSection('manager')}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors duration-150"
        >
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-full text-white bg-blue-600">M</span>
            <span>Manager Dashboard</span>
          </div>
          <FiChevronDown className={`h-4 w-4 transition-transform duration-200 ${isManagerExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isManagerExpanded && (
          <div className="ml-3 mt-2 space-y-1">
            {/* Main Dashboard Link */}
            {managerMainItems.map((item) => {
              const isActive = pathname === item.path;
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

            {/* Subsections */}
            {renderNavSection('Stock Management', 'manager-stock', managerStockItems, 'bg-blue-500', true)}
            {renderNavSection('Business Operations', 'manager-business', managerBusinessItems, 'bg-purple-500', true)}
            {renderNavSection('Personnel', 'manager-personnel', managerPersonnelItems, 'bg-orange-500', true)}
            {renderNavSection('Hydroponics', 'manager-hydroponics', managerHydroponicsItems, 'bg-cyan-500', true)}
            
            {/* Development Sections in Manager View */}
            <div className="ml-4 mt-3 mb-2">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider border-l-2 border-yellow-400 pl-3">
                🚧 In Development
              </div>
            </div>
            {renderNavSection('Plant Growth Cycles', 'manager-plant-cycles', plantCyclesItems, 'bg-green-500', true)}
            {renderNavSection('Animal Cycles', 'manager-animal-cycles', animalCyclesItems, 'bg-amber-500', true)}
          </div>
        )}
      </div>
    );
  };

  // Sidebar content as a component for reuse
  const SidebarContent = (
    <div className="flex flex-col h-full w-full px-4 pt-6 pb-4 min-h-0">
      {/* Logo/Header */}
      <div className="mb-6 w-full flex items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <FiShield className="h-6 w-6 text-red-600" />
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Admin Console</h1>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
        <p className="text-xs text-red-700 font-medium">
          🔒 Administrator Access - All Role Dashboards
        </p>
      </div>

      {/* Navigation Sections - Scrollable */}
      <nav className="flex flex-col gap-1 w-full flex-1 overflow-y-auto min-h-0">
        {renderNavSection('Admin', 'admin', adminNavItems, 'bg-red-600')}
        {renderManagerSection()}
        {renderNavSection('Sponsor Dashboard', 'sponsor', sponsorNavItems, 'bg-purple-600')}
        {renderNavSection('Visitor Dashboard', 'visitor', visitorNavItems, 'bg-green-600')}
        {renderNavSection('🔍 User Views (Debug)', 'user-views', userViewItems, 'bg-orange-600')}
        {renderNavSection('🛠️ Developer Tools', 'developer-tools', developerToolsItems, 'bg-indigo-600')}
        {renderNavSection('🔗 System Pages (Direct)', 'system-pages', systemPagesItems, 'bg-gray-600')}
      </nav>

      {/* Sign out - Fixed at bottom */}
      <div className="w-full flex items-center mt-4 flex-shrink-0">
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
          {/* Sidebar content takes full height with proper scrolling */}
          <div className="flex-1 overflow-hidden">
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