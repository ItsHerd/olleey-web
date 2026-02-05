'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoStateManager } from './demoStateManager';
import { tokenStorage } from './api';

interface DemoContextType {
  isDemoMode: boolean;
  getVideoState: (videoId: string, langCode: string) => any;
  updateVideoState: (videoId: string, jobId: string, langCode: string, newStatus: string) => Promise<void>;
  startProcessing: (videoId: string, jobId: string, langCode?: string) => Promise<void>;
  pauseJob: (videoId: string, jobId: string, langCode?: string) => Promise<void>;
  stopJob: (videoId: string, jobId: string, langCode?: string) => Promise<void>;
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
  
  const startProcessing = async (videoId: string, jobId: string, langCode: string = 'es') => {
    // Update to processing immediately for instant UI feedback
    DemoStateManager.setState({
      videoId, 
      jobId, 
      languageCode: langCode,
      status: 'processing',
      lastUpdated: new Date().toISOString()
    });
    
    // Trigger refresh
    setRefreshTrigger(prev => prev + 1);
    
    // Call backend to simulate processing (3-4 seconds)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = tokenStorage.getAccessToken();
      
      const response = await fetch(
        `${baseUrl}/jobs/${jobId}/start-processing?language_code=${langCode}`, 
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error('Failed to start processing:', await response.text());
        return;
      }
      
      // Backend automatically moves to draft after 3.5s
      // Poll for status update or wait 4s then update to draft
      setTimeout(() => {
        DemoStateManager.setState({
          videoId, 
          jobId, 
          languageCode: langCode,
          status: 'draft',
          lastUpdated: new Date().toISOString()
        });
        setRefreshTrigger(prev => prev + 1);
      }, 4000);
    } catch (error) {
      console.error('Failed to start processing:', error);
    }
  };
  
  const pauseJob = async (videoId: string, jobId: string, langCode: string = 'es') => {
    // Return to queued state
    DemoStateManager.setState({
      videoId, 
      jobId, 
      languageCode: langCode,
      status: 'queued',
      lastUpdated: new Date().toISOString()
    });
    
    // Sync to backend
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = tokenStorage.getAccessToken();
      
      const response = await fetch(
        `${baseUrl}/jobs/${jobId}/pause?language_code=${langCode}`, 
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error('Failed to pause job:', await response.text());
      }
    } catch (error) {
      console.error('Failed to pause job:', error);
    }
    
    // Trigger refresh
    setRefreshTrigger(prev => prev + 1);
  };
  
  const stopJob = async (videoId: string, jobId: string, langCode: string = 'es') => {
    // Clear state (remove from demo tracking)
    DemoStateManager.clearStates();
    
    // Optionally sync to backend to cancel the job
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = tokenStorage.getAccessToken();
      
      // Use the pause endpoint to move back to queued, or implement a cancel endpoint
      const response = await fetch(
        `${baseUrl}/jobs/${jobId}/pause?language_code=${langCode}`, 
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error('Failed to stop job:', await response.text());
      }
    } catch (error) {
      console.error('Failed to stop job:', error);
    }
    
    // Trigger refresh
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <DemoContext.Provider value={{ 
      isDemoMode, 
      getVideoState, 
      updateVideoState, 
      startProcessing,
      pauseJob,
      stopJob,
      refreshTrigger 
    }}>
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
