"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Global toast listener for custom events
 * Listens for 'olleey-toast' events and shows toasts
 */
export function ToastListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type: 'success' | 'error' | 'info' }>;
      const { message, type } = customEvent.detail;

      toast(message, type);
    };

    window.addEventListener('olleey-toast', handleToast);

    return () => {
      window.removeEventListener('olleey-toast', handleToast);
    };
  }, [toast]);

  return null; // This component renders nothing
}
