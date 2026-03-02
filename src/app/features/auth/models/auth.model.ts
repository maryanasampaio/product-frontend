export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;              // Backend retorna 'token'
  username: string;
  permission: string;         // Ex: 'ADMIN', 'USER'
  message?: string;           // Mensagem do backend
  expiresIn?: number;         // Opcional
}

export interface User {
  username: string;
  token: string;
  permission: string;
}
