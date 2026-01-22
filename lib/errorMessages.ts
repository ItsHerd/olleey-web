/**
 * Converts technical error codes/messages to user-friendly error messages
 */

export interface ErrorDetails {
  code?: string;
  message?: string;
  detail?: string;
}

/**
 * Maps error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  INVALID_LOGIN_CREDENTIALS: "The email or password you entered is incorrect. Please check your credentials and try again.",
  INVALID_CREDENTIALS: "The email or password you entered is incorrect. Please check your credentials and try again.",
  USER_NOT_FOUND: "No account found with this email address. Please check your email or create a new account.",
  INVALID_PASSWORD: "The password you entered is incorrect. Please try again or use 'Reset password' if you've forgotten it.",
  INVALID_EMAIL: "Please enter a valid email address.",
  EMAIL_REQUIRED: "Email address is required.",
  PASSWORD_REQUIRED: "Password is required.",
  
  // Account status errors
  ACCOUNT_DISABLED: "Your account has been disabled. Please contact support for assistance.",
  ACCOUNT_LOCKED: "Your account has been temporarily locked due to too many failed login attempts. Please try again in a few minutes or reset your password.",
  EMAIL_NOT_VERIFIED: "Please verify your email address before signing in. Check your inbox for a verification email.",
  
  // Network/Server errors
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection and try again.",
  SERVER_ERROR: "We're experiencing technical difficulties. Please try again in a few moments.",
  TIMEOUT: "The request took too long to complete. Please check your connection and try again.",
  
  // Token errors
  TOKEN_EXPIRED: "Your session has expired. Please sign in again.",
  INVALID_TOKEN: "Your session is invalid. Please sign in again.",
  NO_TOKEN: "Please sign in to continue.",
  
  // Generic fallbacks
  LOGIN_FAILED: "Unable to sign in. Please check your credentials and try again.",
  AUTHENTICATION_FAILED: "Authentication failed. Please try again.",
};

/**
 * Extracts error message from various error formats
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as ErrorDetails;
    return err.detail || err.message || err.code || 'An unknown error occurred';
  }
  
  return 'An unknown error occurred';
}

/**
 * Converts technical error codes to user-friendly messages
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const errorMessage = extractErrorMessage(error);
  
  // Check if it's a known error code
  const upperMessage = errorMessage.toUpperCase().trim();
  
  // Direct match
  if (ERROR_MESSAGES[upperMessage]) {
    return ERROR_MESSAGES[upperMessage];
  }
  
  // Check for partial matches (e.g., "INVALID_LOGIN_CREDENTIALS" in a longer message)
  for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
    if (upperMessage.includes(code)) {
      return message;
    }
  }
  
  // Check for common patterns
  if (upperMessage.includes('NETWORK') || upperMessage.includes('FETCH') || upperMessage.includes('CONNECTION')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (upperMessage.includes('TIMEOUT')) {
    return ERROR_MESSAGES.TIMEOUT;
  }
  
  if (upperMessage.includes('500') || upperMessage.includes('INTERNAL SERVER')) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  
  if (upperMessage.includes('401') || upperMessage.includes('UNAUTHORIZED')) {
    return ERROR_MESSAGES.INVALID_LOGIN_CREDENTIALS;
  }
  
  if (upperMessage.includes('404') || upperMessage.includes('NOT FOUND')) {
    return ERROR_MESSAGES.USER_NOT_FOUND;
  }
  
  // If it's already user-friendly (contains helpful context), return as-is
  if (errorMessage.length > 50 && !upperMessage.includes('_')) {
    return errorMessage;
  }
  
  // Default fallback
  return ERROR_MESSAGES.LOGIN_FAILED;
}

/**
 * Checks if error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  const message = extractErrorMessage(error).toUpperCase();
  return message.includes('NETWORK') || 
         message.includes('FETCH') || 
         message.includes('CONNECTION') ||
         message.includes('TIMEOUT') ||
         message.includes('FAILED TO FETCH');
}

/**
 * Checks if error is a credentials error
 */
export function isCredentialsError(error: unknown): boolean {
  const message = extractErrorMessage(error).toUpperCase();
  return message.includes('INVALID_LOGIN') ||
         message.includes('INVALID_CREDENTIALS') ||
         message.includes('INVALID_PASSWORD') ||
         message.includes('USER_NOT_FOUND') ||
         message.includes('401');
}
