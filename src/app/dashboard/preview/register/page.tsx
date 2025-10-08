'use client';

import { useState } from 'react';
import { FiExternalLink, FiMonitor, FiSmartphone, FiRefreshCw } from 'react-icons/fi';

// Import the actual register page component
import RegisterPage from '../../../auth/register/page';

export default function PreviewRegisterPage() {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showDebugInfo, setShowDebugInfo] = useState(true);

  return (
    <div className="h-full flex flex-col -m-4 md:-m-6">
      {/* Debug Header - Collapsible */}
      {showDebugInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-3 mx-4 md:mx-6 mt-4 md:mt-6 rounded-r-lg shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FiMonitor className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Registration Page Preview</h3>
                <p className="text-sm text-blue-700">Exact rendering as new users see it</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'desktop'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <FiMonitor className="w-3 h-3 mr-1 inline" />Desktop
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'mobile'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <FiSmartphone className="w-3 h-3 mr-1 inline" />Mobile
                </button>
              </div>
              
              <a
                href="/auth/register"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
              >
                <FiExternalLink className="w-3 h-3" />
                New Tab
              </a>
              
              <button
                onClick={() => setShowDebugInfo(false)}
                className="text-blue-600 hover:text-blue-800 font-bold text-lg leading-none"
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
          className="fixed top-4 right-4 z-50 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          title="Show debug info"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      )}
      
      {/* Exact Page Rendering */}
      <div className="flex-1 overflow-hidden">
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
              ...(viewMode === 'mobile' && {
                fontSize: '16px',
                WebkitTextSizeAdjust: '100%',
                touchAction: 'manipulation',
              })
            }}
          >
            {viewMode === 'mobile' && (
              <div className="contents" style={{ width: '375px', maxWidth: '375px', minWidth: '375px' }}>
                <div className="relative isolate w-[375px]">
                  <div className="[&>*]:relative [&>*]:z-auto [&_*[style*='position:fixed']]:absolute [&_*[style*='position:absolute']]:relative [&_.fixed]:absolute [&_.absolute]:relative [&>*]:max-w-[375px]">
                    <RegisterPage />
                  </div>
                </div>
              </div>
            )}
            
            {viewMode === 'desktop' && (
              <div className="relative isolate">
                <div className="[&>*]:relative [&>*]:z-auto [&_*[style*='position:fixed']]:absolute [&_*[style*='position:absolute']]:relative [&_.fixed]:absolute [&_.absolute]:relative">
                  <RegisterPage />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}