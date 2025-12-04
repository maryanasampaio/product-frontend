export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  nome: string;
  token: string;
}

export interface User {
  username: string;
  nome: string;
  token: string;
}
