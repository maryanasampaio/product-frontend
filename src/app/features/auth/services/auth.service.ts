/**
 * AUTH SERVICE
 *
 * Orquestra o fluxo de autenticação:
 * - Chama Repository (API)
 * - Salva no localStorage
 * - Redireciona usuário
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthRepository } from '../repositories/auth.repository';
import { LoginRequest, LoginResponse, User } from '../models/auth.model';
import { saveToken, saveUser, removeToken, removeUser, getToken, getUser } from '../utils/storage.util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private router: Router
  ) {}

  /**
   * Login: autentica usuário
   * - Chama API via Repository
   * - Salva token e user no localStorage
   * - Redireciona para /dashboard
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const credentials: LoginRequest = { username, password };

    return this.authRepository.login(credentials).pipe(
      tap(response => {
        saveToken(response.token);
        saveUser(response.username, response.nome);
        this.router.navigate(['/dashboard']);
      }),
      catchError(error => {
        console.error('Erro no login:', error);
        return throwError(() => new Error('Falha na autenticação. Verifique suas credenciais.'));
      })
    );
  }

  /**
   * Logout: remove autenticação e redireciona
   */
  logout(): void {
    removeToken();
    removeUser();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return getToken();
  }

  getCurrentUser(): User | null {
    const user = getUser();
    const token = getToken();

    if (user && token) {
      return { ...user, token };
    }

    return null;
  }

  isAuthenticated(): boolean {
    return !!getToken();
  }
}
