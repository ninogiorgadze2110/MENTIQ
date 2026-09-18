export type EducationLevel = 'preschool' | 'school' | 'adult';

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
  educationLevel: EducationLevel;
  grade: number;
  age?: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  grade: number;
  educationLevel: EducationLevel;
  age?: number | null;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: UserDto;
}

/** Consistent API error shape returned by the backend. */
export interface ApiError {
  status: number;
  message: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}
