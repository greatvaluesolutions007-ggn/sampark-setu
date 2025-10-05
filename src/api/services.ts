import { Get, Post } from './axiosInstance';
import axiosInstance from './axiosInstance';
import API_PATHS from './constant';
import type {
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  CreateUserResponse,
  User,
  Region,
  CreateToliRequest,
  CreateToliResponse,
  CreatePersonRequest,
  CreatePersonResponse,
  CreateVisitRequest,
  CreateVisitResponse,
  Toli,
  Person,
  Visit,
  apiResponseType,
  RegionDetails,
  RegionResponse,
} from '@/types';

// Authentication Services
export const authService = {
  login: async (credentials: LoginRequest): Promise<apiResponseType<LoginResponse>> => {
    const response = await Post<LoginResponse>("USER", API_PATHS.LOGIN, credentials);
    return response;
  },

  getCurrentUser: async (): Promise<apiResponseType<User>> => {
    const response = await Get<User>("USER", API_PATHS.GET_CURRENT_USER);
    return response;
  },

  createUser: async (userData: CreateUserRequest): Promise<apiResponseType<CreateUserResponse>> => {
    const response = await Post<CreateUserResponse>("USER", API_PATHS.CREATE_USER, userData);
    return response;
  },
};

// Region Services
export const regionService = {
  getRegions: async (type: 'PRANT' | 'VIBHAG' | 'JILA' | 'NAGAR' | 'KHAND', parentId?: number): Promise<apiResponseType<Region[]>> => {
    const params: Record<string, string> = { type };
    
    // Add parent ID parameter based on type
    switch (type) {
      case 'VIBHAG':
        if (parentId) params.parent_id = parentId.toString();
        break;
      case 'JILA':
        if (parentId) params.parent_id = parentId.toString();
        break;
      case 'NAGAR':
        if (parentId) params.parent_id = parentId.toString();
        break;
      case 'KHAND':
        if (parentId) params.parent_id = parentId.toString();
        break;
    }
    
    const response = await axiosInstance.get<apiResponseType<Region[]>>(API_PATHS.GET_REGIONS, { params });
    return response.data;
  },

  getRegionById: async (regionId: number): Promise<apiResponseType<Region>> => {
    const response = await Get<Region>("USER", `${API_PATHS.GET_REGIONS}/${regionId}`);
    return response;
  },

  // New function to get region hierarchy
  getRegionHierarchy: async (regionId: number): Promise<apiResponseType<RegionDetails>> => {
    console.log(`[regionService] Requesting region hierarchy for ID: ${regionId}`);
    const response = await axiosInstance.get<apiResponseType<RegionDetails>>(`/regions/hierarchy/${regionId}`);
    return response.data;
  },

  // Fetch regions with region_id and ignore_validation parameters
  fetchRegions: async (regionId: number, ignoreValidation: boolean = true): Promise<RegionResponse> => {
    const params = {
      region_id: regionId.toString(),
      ignore_validation: ignoreValidation ? 'yes' : 'no'
    };
    const response = await axiosInstance.get<RegionResponse>(API_PATHS.FETCH_REGIONS, { params });
    return response.data;
  }
};

// Toli Services
export const toliService = {
  createToli: async (toliData: CreateToliRequest): Promise<apiResponseType<CreateToliResponse>> => {
    const response = await Post<CreateToliResponse>("USER", API_PATHS.CREATE_TOLI, toliData);
    return response;
  },

  getTolis: async (params?: { region_id?: number; type?: string; limit?: number; offset?: number }): Promise<apiResponseType<Toli[]>> => {
    const response = await Get<Toli[]>("USER", API_PATHS.GET_TOLIS, params);
    return response;
  },
};

// Person Services (Utsuk Shakti)
export const personService = {
  createPerson: async (personData: CreatePersonRequest): Promise<apiResponseType<CreatePersonResponse>> => {
    const response = await Post<CreatePersonResponse>("USER", API_PATHS.CREATE_PERSON, personData);
    return response;
  },

  getPersons: async (params?: { region_id?: number; search?: string; limit?: number; offset?: number }): Promise<apiResponseType<Person[]>> => {
    const response = await Get<Person[]>("USER", API_PATHS.GET_PERSONS, params);
    return response;
  },
};

// Visit Services (Parivar Data)
export const visitService = {
  createVisit: async (visitData: CreateVisitRequest): Promise<apiResponseType<CreateVisitResponse>> => {
    const response = await Post<CreateVisitResponse>("USER", API_PATHS.CREATE_VISIT, visitData);
    return response;
  },

  getVisits: async (params?: {
    region_id?: number;
    toli_id?: number;
    user_id?: number;
    start_date?: string;
    end_date?: string;
    search?: string;
    limit?: number;
    offset?: number
  }): Promise<apiResponseType<Visit[]>> => {
    const response = await Get<Visit[]>("USER", API_PATHS.GET_VISITS, params);
    return response;
  },
};
