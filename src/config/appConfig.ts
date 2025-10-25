// Application Configuration
export const APP_CONFIG = {
  // Set to true to use real APIs, false to use dummy data
  USE_REAL_API: true,
  
  // API Configuration
  API_BASE_URL: 'https://api.rsssgs.com',
  
  // Development flags
  DEBUG_MODE: true,
  ENABLE_CONSOLE_LOGS: true,
}

// Helper function to check if we should use real API
export const shouldUseRealAPI = (): boolean => {
  return APP_CONFIG.USE_REAL_API
}

// Helper function to get API base URL
export const getApiBaseUrl = (): string => {
  return APP_CONFIG.API_BASE_URL
}
