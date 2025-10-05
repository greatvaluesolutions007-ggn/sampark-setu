const API_PATHS = {
  // Authentication
  LOGIN: '/login',
  GET_CURRENT_USER: '/users/me',
  CREATE_USER: '/users',
  
  // Regions
  GET_REGIONS: '/v1/regions',
  FETCH_REGIONS: '/fetch-regions',

  GET_REGION_HIERARCHY: '/fetch-regions',
  
  // Toli Management
  CREATE_TOLI: '/toli',
  GET_TOLIS: '/toli',
  
  // Person Management (Utsuk Shakti)
  CREATE_PERSON: '/person',
  GET_PERSONS: '/person',
  
  // Visit Management (Parivar Data)
  CREATE_VISIT: '/visit',
  GET_VISITS: '/visit',
}

export default API_PATHS;