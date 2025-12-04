/**
 * AUTH SERVICE
 *
 * Orquestra o fluxo de autenticação:
 * - Chama Repository (API)
 * - Gerencia estado de autenticação
 * - Salva/recupera dados do localStorage
 *
 * RESPONSABILIDADES:
 * ✅ Chamar AuthRepository para login
 * ✅ Armazenar token e dados do usuário
 * ✅ Verificar se usuário está autenticado
 */

import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthRepository } from '../repositories/auth.repository';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { saveToken, saveUser, removeToken, removeUser, getToken, getUser } from '../utils/storage.util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  /**
   * LOGIN
   *
   * Realiza autenticação do usuário
   * - Chama repository para fazer request à API
   * - Salva token e dados do usuário no localStorage
   * - Retorna Observable para o component tratar
   *
   * @param username - Nome de usuário
   * @param password - Senha
   * @returns Observable<LoginResponse> - Dados do usuário autenticado
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const credentials: LoginRequest = { username, password };

    return this.authRepository.login(credentials).pipe(
      tap(response => {
        // Salva dados no localStorage
        saveToken(response.token);
        saveUser(response.username, response.nome);
      })
      // NÃO trata erro aqui - deixa o component decidir o que fazer
    );
  }

  /**
   * LOGOUT
   *
   * Remove token e dados do usuário do localStorage
   */
  logout(): void {
    removeToken();
    removeUser();
  }

  /**
   * IS AUTHENTICATED
   *
   * Verifica se usuário está autenticado (tem token válido)
   * @returns true se existe token, false caso contrário
   */
  isAuthenticated(): boolean {
    return !!getToken();
  }

  /**
   * GET TOKEN
   *
   * Retorna o token JWT armazenado
   * @returns Token ou null se não existir
   */
  getToken(): string | null {
    return getToken();
  }

  /**
   * GET CURRENT USER
   *
   * Retorna dados do usuário logado
   * @returns Dados do usuário ou null
   */
  getCurrentUser() {
    return getUser();
  }
}
