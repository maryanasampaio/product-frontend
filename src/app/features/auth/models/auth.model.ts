export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  username: string;
  expiresIn?: number;
}

export interface User {
  username: string;
  accessToken: string;
}
