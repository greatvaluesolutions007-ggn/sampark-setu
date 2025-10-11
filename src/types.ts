export type BasePathType = "USER";

export interface apiResponseType<T> {
    success: boolean;
    message: string;
    statusCode: number;
    data: T;
  }

  export interface IParams {
    [field: string]: unknown;
  }

// API Request/Response Types
export interface LoginRequest extends IParams {
  user_name: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  region_id: number | null;
}

export interface ResetPasswordRequest extends IParams {
  user_name: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
  status: string;
}

export interface CreateUserRequest extends IParams {
  user_name: string;
  password: string;
  role: 'ADMIN' | 'PRANT_KARYAKARTA' | 'VIBHAG_KARYAKARTA' | 'JILA_KARYAKARTA' | 'NAGAR_KARYAKARTA';
  region_id: number | null;
}

export interface CreateUserResponse {
  user_id: number;
  user_name: string;
  role: string;
  region_id: number | null;
  is_active: number;
}

export interface User {
  user_id: number;
  user_name: string;
  full_name?: string;
  role: string;
  region_id: number | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  region_details?:RegionDetails | null;
}


export interface RegionResponse {
  success: boolean;
  data: RegionData;
}

export interface RegionData {
  region_name: string;
  region_type: "prant" | "vibhag" | "jila" | "nagar" | "khand"; // you can add more if needed
  child_region_names: string[];
  child_regions: {
    vibhag?: RegionType[];
    jila?: RegionType[];
    nagar?: RegionType[];
    khand?: RegionType[];
  };
}







export interface RegionDetails {
  prant: Region | null;
  vibhag: Region | null;
  jila: Region | null;
  nagar: Region | null;
}


export interface RegionType {
  id: number;
  name: string;
  code: string;
  
}


export interface Region {
  region_id: number;
  name: string;
  code: string;
  type: 'PRANT' | 'VIBHAG' | 'JILA' | 'NAGAR' | 'KHAND' | 'BASTI' | 'MANDAL' | 'GRAM';
  parent_id?: number | null;
  created_at?: string | null;
  updated_at?: string| null;
}

export interface RegionHierarchy {
  prant: Region | null;
  vibhag: Region | null;
  jila: Region | null;
  nagar: Region | null;
  khand: Region | null;
  basti: Region | null;
  mandal: Region | null;
  gram: Region | null;
}

export interface ToliMember {
  name: string;
  mobile: string;
}

export interface CreateToliRequest extends IParams {
  name: string;
  members: ToliMember[];
}

export interface CreateToliResponse {
  toli_id: number;
  status: string;
}

export interface CreatePersonRequest extends IParams {
  name: string;
  phone_number?: string;
  email?: string;
  sex: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';
  address_text?: string;
  region_id?: number;
  visheshta?: string;
  answers?: Record<string, string>;
}

export interface CreatePersonResponse {
  person_id: number;
  status: string;
}

export interface CreateVisitRequest extends IParams {
  person_name: string;
  person_phone?: string;
  person_email?: string;
  person_sex: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';
  toli_id?: number;
  region_id?: number;
  visited_at?: string;
  total_members: number;
  male_count: number;
  female_count: number;
  kids_count: number;
  nishulk_sticker: number;
  nishulk_folder: number;
  nishulk_books: number;
  shashulk_pushtak: number;
  address_text?: string;
  notes?: string;
}

export interface CreateVisitResponse {
  visit_id: number;
  status: string;
}

// Additional response types for GET endpoints
export interface Toli {
  toli_id: number;
  name: string;
  type: 'PRANT' | 'VIBHAG' | 'JILA' | 'NAGAR' | 'KHAND';
  region_id: number;
  toli_user_id: number | null;
  pramukh_json: ToliMember;
  members_json: ToliMember[];
  created_at: string;
  updated_at: string;
}

export interface Person {
  person_id: number;
  name: string;
  phone_number: string | null;
  email: string | null;
  sex: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';
  address_text: string | null;
  region_id: number | null;
  created_by: number;
  visheshta: string | null;
  answers_json: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  visit_id: number;
  person_name: string;
  person_phone: string | null;
  person_email: string | null;
  person_sex: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';
  toli_id: number | null;
  region_id: number | null;
  visited_at: string;
  created_by: number;
  total_members: number;
  male_count: number;
  female_count: number;
  kids_count: number;
  nishulk_sticker: number;
  nishulk_folder: number;
  nishulk_books: number;
  shashulk_pushtak: number;
  address_text: string | null;
  notes: string | null;
  created_at: string;
}

// Code Validation Types
export interface ValidateCodeRequest extends IParams {
  user_code: string;
}

export interface ValidateCodeResponse {
  is_valid: boolean;
  access_level: 'TOLI_CREATION' | 'VIEW_ONLY' | null;
  allowed_region_types: ('PRANT' | 'VIBHAG' | 'JILA' | 'NAGAR' | 'KHAND' | 'BASLI' | 'GRAM')[];
  message: string;
}

// Enhanced User Creation with Code
export interface CreateUserWithCodeRequest extends IParams {
  user_code: string;
  user_name: string;
  password: string;
  full_name: string;
  mobile_number: string;
  region_id: number;
}

// Reporting Summary Types
export interface ToliSummaryResponse {
  total_tolies?: number;
}

export interface UtsukSummaryResponse {
  utsuk_count?: number;
}

export interface ParivarSummaryResponse {
  total_families?: number;
  total_contacted?: number;
  male_count?: number;
  female_count?: number;
  kids_count?: number;
}

export interface SahityaSummaryResponse {
  sticker_count?: number;
  total_folder?: number;
  nishulk_books?: number;
  shashulk_books?: number;
}