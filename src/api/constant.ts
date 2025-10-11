const API_PATHS = {
  // Authentication
  LOGIN: '/login',
  GET_CURRENT_USER: '/users/me',
  CREATE_USER: '/users',
  RESET_PASSWORD: '/reset-password',
  
  // Code Validation (Legacy - keep for backward compatibility)
  VALIDATE_CODE: '/validate-code',
  CREATE_USER_WITH_CODE: '/users',
  
  // Regions
  GET_REGIONS: '/regions',
  FETCH_REGIONS: '/regions',
  GET_REGION_HIERARCHY: '/regions',
  
  // Toli Management
  CREATE_TOLI: '/toli',
  GET_TOLIS: '/toli',
  
  // Person Management (Utsuk Shakti)
  CREATE_PERSON: '/person',
  GET_PERSONS: '/person',
  
  // Visit Management (Parivar Data)
  CREATE_VISIT: '/visit',
  GET_VISITS: '/visit',
  
  // Reporting APIs
  TOLI_SUMMARY: '/reporting/tolis/summary',
  UTSUK_SUMMARY: '/reporting/utsukshakti/summary',
  PARIVAR_SUMMARY: '/reporting/parivar/summary',
  SAHITYA_SUMMARY: '/reporting/sahitya/summary',
}

export default API_PATHS;