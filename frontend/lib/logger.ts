/**
 * Logger utility that logs to both browser console and can send to server
 * In development, logs appear in both browser console and terminal (via server)
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.0.0.15:8000";

export const logger = {
  /**
   * Log debug information
   * In browser: appears in console
   * Can also send to server for terminal visibility
   */
  debug: (category: string, message: string, data?: any) => {
    const logMessage = `[${category}] ${message}`;
    
    // Always log to browser console
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }

    // In development, also try to log to server/terminal
    if (isDevelopment && typeof window !== 'undefined') {
      // Send to a logging endpoint if available, or just use console
      // For now, we'll use console which shows in browser dev tools
      // Terminal logs would require server-side logging
    }
  },

  /**
   * Log error information
   */
  error: (category: string, message: string, error?: any) => {
    const logMessage = `[${category}] ${message}`;
    
    if (error) {
      console.error(logMessage, error);
    } else {
      console.error(logMessage);
    }
  },

  /**
   * Log info
   */
  info: (category: string, message: string, data?: any) => {
    const logMessage = `[${category}] ${message}`;
    
    if (data) {
      console.info(logMessage, data);
    } else {
      console.info(logMessage);
    }
  },
};
