"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiActivity, FiServer, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';

interface ManagerSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const managerNavItems = [
  { path: '/managerDashboard', label: 'Dashboard', icon: FiServer },
];

// Grouped navigation items
const stockManagementItems = [
  { path: '/managerDashboard/medical-stock', label: 'Medical Stock', icon: FiActivity },
  { path: '/managerDashboard/food-stock', label: 'Food Stock', icon: FiActivity },
  { path: '/managerDashboard/plant-stock', label: 'Plant Stock', icon: FiActivity },
];

const businessOperationsItems = [
  { path: '/managerDashboard/products', label: 'Products', icon: FiServer },
  { path: '/managerDashboard/suppliers', label: 'Suppliers', icon: FiServer },
  { path: '/managerDashboard/invoices', label: 'Invoices & Receipts', icon: FiServer },
];

const personnelItems = [
  { path: '/managerDashboard/staff', label: 'Staff Management', icon: FiServer },
];

const hydroponicsItems = [
  { path: '/managerDashboard/hydroponic-barley', label: 'Hydroponic Barley Cycles', icon: FiActivity },
];

export default function ManagerNavigation({ mobileOpen, setMobileOpen }: ManagerSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    stock: true,
    business: false,
    personnel: false,
    hydroponics: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActiveInGroup = (items: Array<{ path: string }>) => {
    return items.some(item => pathname === item.path || 
      (item.path !== '/managerDashboard' && pathname.startsWith(`${item.path}/`)));
  };

  const renderNavSection = (
    title: string,
    sectionKey: string,
    items: Array<{ path: string; label: string; icon: any }>,
    badgeColor: string
  ) => {
    const isExpanded = expandedSections[sectionKey];
    const isGroupActive = isActiveInGroup(items);
    const ChevronIcon = isExpanded ? FiChevronDown : FiChevronRight;

    return (
      <div className="mb-2">
        {/* Section Header */}
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
            isGroupActive
              ? 'bg-green-100 text-green-700'
              : 'text-gray-700 hover:bg-green-50 hover:text-green-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs rounded-full text-white ${badgeColor}`}>
              {title.charAt(0).toUpperCase()}
            </span>
            <span>{title}</span>
          </div>
          <ChevronIcon className="h-4 w-4" />
        </button>

        {/* Section Items */}
        {isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.path || 
                (item.path !== '/managerDashboard' && pathname.startsWith(`${item.path}/`));
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

  const SidebarContent = (
    <div className="flex flex-col h-full w-full px-4 pt-8 pb-4 overflow-y-auto">
      {/* Logo/Header */}
      <div className="mb-6 w-full flex items-center">
        <h1 className="text-2xl font-bold text-green-600 tracking-tight pl-2">FarmLab Dashboard</h1>
      </div>
      
      {/* Main Dashboard Link */}
      <nav className="flex flex-col gap-2 w-full mb-4">
        {managerNavItems.map((item) => {
          const isActive = pathname === item.path;
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

      {/* Grouped Navigation Sections */}
      <div className="space-y-2">
        {renderNavSection('Stock Management', 'stock', stockManagementItems, 'bg-blue-600')}
        {renderNavSection('Business Operations', 'business', businessOperationsItems, 'bg-purple-600')}
        {renderNavSection('Personnel', 'personnel', personnelItems, 'bg-orange-600')}
        {renderNavSection('Hydroponics', 'hydroponics', hydroponicsItems, 'bg-cyan-600')}
      </div>

      {/* Spacer to push sign out to bottom on tall screens */}
      <div className="flex-1" />
      
      {/* Sign out */}
      <div className="w-full flex items-center mt-4">
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