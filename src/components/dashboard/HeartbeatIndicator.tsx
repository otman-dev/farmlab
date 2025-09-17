'use client';

import { useState, useEffect } from 'react';
import { FiActivity } from 'react-icons/fi';

interface HeartbeatIndicatorProps {
  lastHeartbeat?: Date | string;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPulse?: boolean;
}

export default function HeartbeatIndicator({
  lastHeartbeat,
  status = 'unknown',
  size = 'md',
  showLabel = true,
  showPulse = true
}: HeartbeatIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  // Size mappings
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const pulseClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  // Update the time ago text
  useEffect(() => {
    setMounted(true);
    
    function updateTimeAgo() {
      if (!lastHeartbeat) {
        setTimeAgo('Never');
        return;
      }
      
      const lastBeatDate = new Date(lastHeartbeat);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastBeatDate.getTime()) / 1000);
      
      // More readable time ago format
      if (diffInSeconds < 5) {
        setTimeAgo('Just now');
      } else if (diffInSeconds < 60) {
        setTimeAgo(`${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`);
      } else if (diffInSeconds < 3600) {
        const mins = Math.floor(diffInSeconds / 60);
        const secs = diffInSeconds % 60;
        setTimeAgo(`${mins} min${mins !== 1 ? 's' : ''} ${secs} sec${secs !== 1 ? 's' : ''} ago`);
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        const mins = Math.floor((diffInSeconds % 3600) / 60);
        setTimeAgo(`${hours} hr${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''} ago`);
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        const hours = Math.floor((diffInSeconds % 86400) / 3600);
        setTimeAgo(`${days} day${days !== 1 ? 's' : ''} ${hours} hr${hours !== 1 ? 's' : ''} ago`);
      }
    }

    updateTimeAgo();
    const intervalId = setInterval(updateTimeAgo, 1000);
    
    return () => clearInterval(intervalId);
  }, [lastHeartbeat]);

  // Don't render anything on the server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  const getStatusClasses = () => {
    switch (status) {
      case 'online':
        return {
          dot: 'bg-green-500',
          text: 'text-green-600',
          pulse: 'bg-green-400'
        };
      case 'offline':
        return {
          dot: 'bg-red-500',
          text: 'text-red-600',
          pulse: 'bg-red-400'
        };
      default:
        return {
          dot: 'bg-yellow-500',
          text: 'text-yellow-600',
          pulse: 'bg-yellow-400'
        };
    }
  };

  const { dot, text, pulse } = getStatusClasses();
  
  return (
    <div className="inline-flex items-center">
      <div className="relative flex items-center justify-center">
        {showPulse && status === 'online' && (
          <span className={`absolute ${pulseClasses[size]} ${pulse} opacity-30 rounded-full animate-ping`}></span>
        )}
        <div className={`relative flex items-center justify-center ${sizeClasses[size]} rounded-full ${dot}`}>
          {size === 'lg' && <FiActivity className="text-white text-xs" />}
        </div>
      </div>
      
      {showLabel && (
        <span className={`ml-2 ${textSizeClasses[size]} ${text} font-medium`}>
          {timeAgo}
        </span>
      )}
    </div>
  );
}