import { Get, Post } from './axiosInstance';
import axiosInstance from './axiosInstance';
import API_PATHS from './constant';
import { DummyDataService } from '@/services/dummyDataService';
import { shouldUseRealAPI } from '@/config/appConfig';
import type {
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  CreateUserResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
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
  RegionHierarchy,
  RegionResponse,
  ValidateCodeRequest,
  ValidateCodeResponse,
  CreateUserWithCodeRequest,
  ToliSummaryResponse,
  UtsukSummaryResponse,
  ParivarSummaryResponse,
  SahityaSummaryResponse,
  HierarchicalSummaryResponse,
  ParivarListResponse,
  ParivarListItem,
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

  resetPassword: async (resetData: ResetPasswordRequest): Promise<apiResponseType<ResetPasswordResponse>> => {
    const response = await axiosInstance.post<apiResponseType<ResetPasswordResponse>>(API_PATHS.RESET_PASSWORD, resetData, {
      headers: {
        'x-secret-key': '123'
      }
    });
    return response.data;
  },

  // New code validation service
  validateCode: async (codeData: ValidateCodeRequest): Promise<apiResponseType<ValidateCodeResponse>> => {
    const response = await Post<ValidateCodeResponse>("USER", API_PATHS.VALIDATE_CODE, codeData);
    return response;
  },

  // New user creation with code validation
  createUserWithCode: async (userData: CreateUserWithCodeRequest): Promise<apiResponseType<CreateUserResponse>> => {
    const response = await Post<CreateUserResponse>("USER", API_PATHS.CREATE_USER_WITH_CODE, userData);
    return response;
  },
};

// Region Services
export const regionService = {
  getRegions: async (
    type: 'PRANT' | 'VIBHAG' | 'JILA' | 'NAGAR' | 'KHAND' | 'BASTI' | 'MANDAL' | 'GRAM', 
    filters?: {
      prant_code?: string;
      vibhag_code?: string;
      jila_code?: string;
      nagar_or_khand_code?: string;
      basti_code?: string;
      mandal_code?: string;
      gram_code?: string;
    }
  ): Promise<apiResponseType<Region[]>> => {
    const params: Record<string, string> = { type };
    
    // Add filter parameters if provided
    if (filters) {
      if (filters.prant_code) params.prant_code = filters.prant_code;
      if (filters.vibhag_code) params.vibhag_code = filters.vibhag_code;
      if (filters.jila_code) params.jila_code = filters.jila_code;
      if (filters.nagar_or_khand_code) params.nagar_or_khand_code = filters.nagar_or_khand_code;
      if (filters.basti_code) params.basti_code = filters.basti_code;
      if (filters.mandal_code) params.mandal_code = filters.mandal_code;
      if (filters.gram_code) params.gram_code = filters.gram_code;
    }
    
    const response = await axiosInstance.get<apiResponseType<Region[]>>(API_PATHS.GET_REGIONS, { params });
    return response.data;
  },

  // New hierarchical region services based on the provided APIs
  getVibhags: async (): Promise<apiResponseType<Region[]>> => {
    const response = await axiosInstance.get<apiResponseType<Region[]>>('/api/regions?type=VIBHAG');
    return response.data;
  },

  getJilas: async (vibhagCode: string): Promise<apiResponseType<Region[]>> => {
    const response = await axiosInstance.get<apiResponseType<Region[]>>(`/api/regions?type=JILA&vibhag_code=${vibhagCode}`);
    return response.data;
  },

  getNagars: async (jilaCode: string): Promise<apiResponseType<Region[]>> => {
    const response = await axiosInstance.get<apiResponseType<Region[]>>(`/api/regions?type=NAGAR&jila_code=${jilaCode}`);
    return response.data;
  },

  getKhands: async (jilaCode: string, vibhagCode: string): Promise<apiResponseType<Region[]>> => {
    const response = await axiosInstance.get<apiResponseType<Region[]>>(`/api/regions?type=KHAND&jila_code=${jilaCode}&vibhag_code=${vibhagCode}`);
    return response.data;
  },

  getBastis: async (nagarOrKhandCode: string, jilaCode: string, vibhagCode: string): Promise<apiResponseType<Region[]>> => {
    const response = await axiosInstance.get<apiResponseType<Region[]>>(`/api/regions?type=BASTI&nagar_or_khand_code=${nagarOrKhandCode}&jila_code=${jilaCode}&vibhag_code=${vibhagCode}`);
    return response.data;
  },

  getMandals: async (jilaCode: string, vibhagCode: string, nagarOrKhandCode: string): Promise<apiResponseType<Region[]>> => {
    const response = await axiosInstance.get<apiResponseType<Region[]>>(`/api/regions?type=MANDAL&jila_code=${jilaCode}&vibhag_code=${vibhagCode}&nagar_or_khand_code=${nagarOrKhandCode}`);
    return response.data;
  },

  getGrams: async (nagarOrKhandCode: string, jilaCode: string, vibhagCode: string, mandalCode: string): Promise<apiResponseType<Region[]>> => {
    const response = await axiosInstance.get<apiResponseType<Region[]>>(`/api/regions?type=GRAM&nagar_or_khand_code=${nagarOrKhandCode}&jila_code=${jilaCode}&vibhag_code=${vibhagCode}&mandal_code=${mandalCode}`);
    return response.data;
  },

  getRegionById: async (regionId: number): Promise<apiResponseType<Region>> => {
    const response = await Get<Region>("USER", `${API_PATHS.GET_REGIONS}/${regionId}`);
    return response;
  },

  // New function to get region hierarchy
  getRegionHierarchy: async (regionId: number): Promise<apiResponseType<RegionHierarchy>> => {
    console.log(`[regionService] Requesting region hierarchy for ID: ${regionId}`);
    const response = await Get<RegionHierarchy>("USER", `/v1/regions/${regionId}/hierarchy`);
    return response;
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

// Reporting Services
export const reportingService = {
  getToliSummary: async (): Promise<apiResponseType<ToliSummaryResponse>> => {
    const response = await Get<ToliSummaryResponse>("USER", API_PATHS.TOLI_SUMMARY);
    return response;
  },

  getUtsukSummary: async (): Promise<apiResponseType<UtsukSummaryResponse>> => {
    const response = await Get<UtsukSummaryResponse>("USER", API_PATHS.UTSUK_SUMMARY);
    return response;
  },

  getParivarSummary: async (): Promise<apiResponseType<ParivarSummaryResponse>> => {
    const response = await Get<ParivarSummaryResponse>("USER", API_PATHS.PARIVAR_SUMMARY);
    return response;
  },

  getSahityaSummary: async (): Promise<apiResponseType<SahityaSummaryResponse>> => {
    const response = await Get<SahityaSummaryResponse>("USER", API_PATHS.SAHITYA_SUMMARY);
    return response;
  },

  // Hierarchical Summary Services
  getToliSummaryList: async (regionId: number): Promise<HierarchicalSummaryResponse> => {
    if (shouldUseRealAPI()) {
      try {
        console.log('🌐 Making API call for Toli summary, regionId:', regionId);
        const response = await axiosInstance.get<HierarchicalSummaryResponse>(API_PATHS.TOLI_SUMMARY_LIST, { 
          params: { 'region-id': regionId } 
        });
        console.log('✅ API response for Toli summary:', response.data);
        return response.data;
      } catch (error) {
        console.log('❌ API failed, falling back to dummy data for Toli summary, regionId:', regionId, error);
        return DummyDataService.getToliSummaryList(regionId);
      }
    } else {
      // Using dummy data
      console.log('📦 Using dummy data for Toli summary, regionId:', regionId);
      const dummyResponse = DummyDataService.getToliSummaryList(regionId);
      console.log('📦 Dummy data response:', dummyResponse);
      return dummyResponse;
    }
  },

  getParivarSummaryList: async (regionId: number): Promise<HierarchicalSummaryResponse> => {
    if (shouldUseRealAPI()) {
      try {
        console.log('🌐 Making API call for Parivar summary, regionId:', regionId);
        const response = await axiosInstance.get<HierarchicalSummaryResponse>(API_PATHS.PARIVAR_SUMMARY_LIST, { 
          params: { 'region-id': regionId } 
        });
        console.log('✅ API response for Parivar summary:', response.data);
        return response.data;
      } catch (error) {
        console.log('❌ API failed, falling back to dummy data for Parivar summary, regionId:', regionId, error);
        return DummyDataService.getParivarSummaryList(regionId);
      }
    } else {
      // Using dummy data
      console.log('📦 Using dummy data for Parivar summary, regionId:', regionId);
      const dummyResponse = DummyDataService.getParivarSummaryList(regionId);
      console.log('📦 Dummy data response:', dummyResponse);
      return dummyResponse;
    }
  },

  getUtsukSummaryList: async (regionId: number): Promise<HierarchicalSummaryResponse> => {
    if (shouldUseRealAPI()) {
      try {
        console.log('🌐 Making API call for Utsuk summary, regionId:', regionId);
        const response = await axiosInstance.get<HierarchicalSummaryResponse>(API_PATHS.UTSUK_SUMMARY_LIST, { 
          params: { 'region-id': regionId } 
        });
        console.log('✅ API response for Utsuk summary:', response.data);
        return response.data;
      } catch (error) {
        console.log('❌ API failed, falling back to dummy data for Utsuk summary, regionId:', regionId, error);
        return DummyDataService.getUtsukSummaryList(regionId);
      }
    } else {
      // Using dummy data
      console.log('📦 Using dummy data for Utsuk summary, regionId:', regionId);
      const dummyResponse = DummyDataService.getUtsukSummaryList(regionId);
      console.log('📦 Dummy data response:', dummyResponse);
      return dummyResponse;
    }
  },
};

// Parivar List Service
export const parivarListService = {
  getParivarList: async (regionId: number): Promise<ParivarListResponse> => {
    if (shouldUseRealAPI()) {
      try {
        console.log('🌐 Making API call for Parivar list, regionId:', regionId);
        const response = await axiosInstance.get<ParivarListResponse>(API_PATHS.PARIVAR_LIST, { 
          params: { 'region-id': regionId } 
        });
        console.log('✅ API response for Parivar list:', response.data);
        return response.data;
      } catch (error) {
        console.log('❌ API failed, falling back to dummy data for Parivar list, regionId:', regionId, error);
        return DummyDataService.getParivarList(regionId);
      }
    } else {
      // Using dummy data
      console.log('📦 Using dummy data for Parivar list, regionId:', regionId);
      const dummyResponse = DummyDataService.getParivarList(regionId);
      console.log('📦 Dummy data response:', dummyResponse);
      return dummyResponse;
    }
  },
};
