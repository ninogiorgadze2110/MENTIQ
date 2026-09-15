export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
  grade: number;
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
