'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoStateManager } from './demoStateManager';
import { tokenStorage } from './api';

interface DemoContextType {
  isDemoMode: boolean;
  getVideoState: (videoId: string, langCode: string) => any;
  updateVideoState: (videoId: string, jobId: string, langCode: string, newStatus: string) => Promise<void>;
  refreshTrigger: number;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    setIsDemoMode(userEmail === 'demo@olleey.com');
  }, [userEmail]);
  
  // Listen for state updates to trigger re-renders
  useEffect(() => {
    const handleStateUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('demo-state-updated', handleStateUpdate);
    return () => window.removeEventListener('demo-state-updated', handleStateUpdate);
  }, []);
  
  const getVideoState = (videoId: string, langCode: string) => {
    return DemoStateManager.getState(videoId, langCode);
  };
  
  const updateVideoState = async (videoId: string, jobId: string, langCode: string, newStatus: string) => {
    // Map frontend status to backend status
    const statusMap: { [key: string]: string } = {
      'processing': 'processing',
      'draft': 'waiting_approval',
      'live': 'published'
    };
    
    const backendStatus = statusMap[newStatus] || newStatus;
    
    // Save to localStorage first for immediate UI update
    DemoStateManager.setState({ 
      videoId, 
      jobId, 
      languageCode: langCode, 
      status: newStatus as any, 
      lastUpdated: new Date().toISOString() 
    });
    
    // Also update backend for consistency
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = tokenStorage.getAccessToken();
      
      const response = await fetch(
        `${baseUrl}/jobs/${jobId}/videos/${langCode}/status?new_status=${backendStatus}`, 
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error('Failed to sync demo state to backend:', await response.text());
      }
    } catch (error) {
      console.error('Failed to sync demo state to backend:', error);
    }
    
    // Trigger refresh
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <DemoContext.Provider value={{ isDemoMode, getVideoState, updateVideoState, refreshTrigger }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within DemoProvider');
  }
  return context;
};
