/**
 * ============================================================================
 * AUTH REPOSITORY - CAMADA DE DADOS
 * ============================================================================
 *
 * RESPONSABILIDADE ÚNICA: Comunicação HTTP com a API
 *
 * O que este arquivo FAZ:
 * ✅ Envia requisições HTTP para o backend
 * ✅ Recebe respostas do backend
 * ✅ Retorna Observables (streams de dados assíncronos)
 *
 * O que este arquivo NÃO FAZ:
 * ❌ Lógica de negócio (validações, transformações)
 * ❌ Armazenamento de dados (localStorage, sessionStorage)
 * ❌ Redirecionamentos de páginas
 * ❌ Tratamento complexo de erros
 * ❌ Manipulação de estado da aplicação
 *
 * ANALOGIA: É como um "carteiro" - apenas entrega e busca mensagens,
 * não decide o que fazer com elas.
 *
 * PADRÃO: Repository Pattern - separa lógica de negócio da camada de dados
 * ============================================================================
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

/**
 * @Injectable({ providedIn: 'root' })
 *
 * Decorator que torna esta classe um serviço injetável.
 * - providedIn: 'root' = cria UMA única instância para toda aplicação (Singleton)
 * - Permite usar Dependency Injection (injeção de dependências)
 */
@Injectable({
  providedIn: 'root'
})
export class AuthRepository {
  /**
   * URL base da API vinda do arquivo de environment
   *
   * private = só pode ser acessado dentro desta classe
   * Valor: 'http://localhost:8080'
   */
  private apiUrl = environment.apiUrl;

  /**
   * CONSTRUTOR - Injeção de Dependências
   *
   * @param http - HttpClient do Angular para fazer requisições HTTP
   *
   * O Angular automaticamente cria e injeta uma instância de HttpClient
   * quando esta classe é instanciada.
   */
  constructor(private http: HttpClient) {}

  /**
   * ========================================================================
   * LOGIN - Autenticação do Usuário
   * ========================================================================
   *
   * Envia credenciais (username e password) para o endpoint de login.
   *
   * FLUXO:
   * 1. Recebe credenciais { username: 'admin', password: '123456' }
   * 2. Faz POST para http://localhost:8080/auth/login
   * 3. Backend valida credenciais
   * 4. Backend retorna { username, nome, token }
   * 5. Retorna Observable que emite a resposta
   *
   * @param credentials - Objeto com username e password
   * @returns Observable<LoginResponse> - Stream que emite a resposta quando chegar
   *
   * OBSERVABLE: É como uma "promessa turbinada" que pode emitir múltiplos valores
   * e pode ser cancelada. Faz parte do RxJS.
   *
   * Exemplo de uso:
   * ```typescript
   * const credentials = { username: 'admin', password: '123456' };
   * this.authRepository.login(credentials).subscribe({
   *   next: (response) => console.log('Sucesso!', response),
   *   error: (error) => console.error('Erro!', error)
   * });
   * ```
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // http.post<T>() - Faz requisição POST
    // - Primeiro parâmetro: URL completa
    // - Segundo parâmetro: corpo da requisição (body)
    // - <LoginResponse>: tipo do retorno esperado
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,  // URL: http://localhost:8080/auth/login
      credentials                    // Body: { username: '...', password: '...' }
    );
  }

  /**
   * ========================================================================
   * LOGOUT - Encerrar Sessão (OPCIONAL)
   * ========================================================================
   *
   * Envia requisição de logout para o backend.
   *
   * NOTA: Muitas vezes o logout é apenas client-side (remove token do localStorage).
   * Este método é útil se o backend precisa invalidar o token no servidor.
   *
   * @returns Observable<void> - Não retorna dados, apenas confirma sucesso
   *
   * Exemplo de uso:
   * ```typescript
   * this.authRepository.logout().subscribe({
   *   next: () => console.log('Logout realizado no servidor'),
   *   error: (error) => console.error('Erro ao fazer logout', error)
   * });
   * ```
   */
  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/auth/logout`,  // URL: http://localhost:8080/auth/logout
      {}                              // Body vazio
    );
  }
}
