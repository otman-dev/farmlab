'use client';

import { useState } from 'react';
import { FiExternalLink, FiMonitor, FiSmartphone, FiRefreshCw } from 'react-icons/fi';

// Import the actual home page component
import HomePage from '../../../page';

export default function PreviewHomePage() {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showDebugInfo, setShowDebugInfo] = useState(true);

  return (
    // Counteract the dashboard layout padding for true full-screen preview
    <div className="h-full flex flex-col -m-4 md:-m-6">
      {/* Debug Header - Collapsible */}
      {showDebugInfo && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-400 p-3 mx-4 md:mx-6 mt-4 md:mt-6 rounded-r-lg shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                <FiMonitor className="w-3 h-3 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-emerald-900 text-sm">Home Page Preview</h3>
                <p className="text-xs text-emerald-700">Exact rendering as public visitors see it</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'desktop'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  <FiMonitor className="w-3 h-3 mr-1 inline" />Desktop
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'mobile'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  <FiSmartphone className="w-3 h-3 mr-1 inline" />Mobile
                </button>
              </div>
              
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-medium"
              >
                <FiExternalLink className="w-3 h-3" />
                New Tab
              </a>
              
              <button
                onClick={() => setShowDebugInfo(false)}
                className="text-emerald-600 hover:text-emerald-800 font-bold text-lg leading-none"
                title="Hide debug info"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Show debug info toggle when hidden */}
      {!showDebugInfo && (
        <button
          onClick={() => setShowDebugInfo(true)}
          className="fixed top-2 right-2 z-50 bg-emerald-500 text-white p-2 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
          title="Show debug info"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      )}
      
      {/* Exact Page Rendering - No top spacing when debug hidden */}
      <div className={`flex-1 overflow-hidden ${
        showDebugInfo ? 'mt-2' : ''
      }`}>
        <div 
          className={`h-full transition-all duration-300 ${
            viewMode === 'mobile' 
              ? 'w-[375px] mx-auto border-x-2 border-gray-300 shadow-xl bg-white rounded-lg overflow-hidden' 
              : 'w-full'
          }`}
        >
          <div 
            className="h-full overflow-y-auto relative"
            style={{
              // Simulate mobile viewport behavior
              ...(viewMode === 'mobile' && {
                fontSize: '16px', // Base mobile font size
                WebkitTextSizeAdjust: '100%', // Prevent iOS text scaling
                touchAction: 'manipulation', // Disable double-tap zoom
              })
            }}
          >
            {/* Mobile viewport meta simulation */}
            {viewMode === 'mobile' && (
              <div 
                className="contents"
                style={{
                  // Force mobile-like rendering
                  width: '375px',
                  maxWidth: '375px',
                  minWidth: '375px',
                }}
              >
                {/* Isolation container to prevent interference with sidebar */}
                <div className="relative isolate w-[375px]">
                  <div className="[&>*]:relative [&>*]:z-auto [&_*[style*='position:fixed']]:absolute [&_*[style*='position:absolute']]:relative [&_.fixed]:absolute [&_.absolute]:relative [&>*]:max-w-[375px]">
                    <HomePage />
                  </div>
                </div>
              </div>
            )}
            
            {/* Desktop rendering */}
            {viewMode === 'desktop' && (
              <div className="relative isolate">
                <div className="[&>*]:relative [&>*]:z-auto [&_*[style*='position:fixed']]:absolute [&_*[style*='position:absolute']]:relative [&_.fixed]:absolute [&_.absolute]:relative">
                  <HomePage />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}