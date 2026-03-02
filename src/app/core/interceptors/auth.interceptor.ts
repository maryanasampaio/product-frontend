/**
 * ============================================================================
 * AUTH INTERCEPTOR - INTERCEPTADOR HTTP
 * ============================================================================
 *
 * RESPONSABILIDADE: Adicionar token JWT automaticamente em TODAS as requisições HTTP
 *
 * O que é um Interceptor?
 * - É um "middleware" que intercepta requisições HTTP
 * - Permite modificar requisições ANTES de enviá-las
 * - Permite modificar respostas ANTES de recebê-las
 *
 * Por que usar?
 * ✅ NÃO precisa adicionar token manualmente em cada requisição
 * ✅ Centraliza lógica de autenticação HTTP
 * ✅ Facilita manutenção (muda em 1 lugar, afeta todas requisições)
 * ✅ Reduz repetição de código
 *
 * Como funciona?
 * 1. Toda requisição HTTP passa por aqui PRIMEIRO
 * 2. Interceptor pega o token do localStorage
 * 3. Adiciona token no header Authorization
 * 4. Requisição continua para o backend
 *
 * ANALOGIA: É como um "porteiro" que coloca um crachá (token) em todas
 * as pessoas (requisições) que entram no prédio (backend).
 * ============================================================================
 */

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { getToken } from '../../features/auth/utils/storage.util';
import { AuthService } from '../../features/auth/services/auth.service';
import { Router } from '@angular/router';

/**
 * @Injectable()
 *
 * Permite injetar este interceptor via Dependency Injection.
 * NÃO tem providedIn: 'root' porque interceptors são registrados de forma especial.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}
  /**
   * ========================================================================
   * INTERCEPT - Interceptar Requisição HTTP
   * ========================================================================
   *
   * Método obrigatório da interface HttpInterceptor.
   * Angular chama este método para TODA requisição HTTP.
   *
   * @param req - Requisição HTTP original
   * @param next - Handler para continuar a cadeia de interceptors
   * @returns Observable do evento HTTP
   *
   * FLUXO:
   * 1. Requisição criada (ex: this.http.get('/products'))
   * 2. Passa pelo intercept()
   * 3. Token é adicionado no header
   * 4. Requisição modificada vai para o backend
   * 5. Backend valida o token
   * 6. Backend retorna resposta
   *
   * Exemplo prático:
   *
   * SEM interceptor (precisa fazer em toda requisição):
   * ```typescript
   * const token = getToken();
   * this.http.get('/products', {
   *   headers: { Authorization: `Bearer ${token}` }
   * });
   * ```
   *
   * COM interceptor (automático):
   * ```typescript
   * this.http.get('/products'); // Token adicionado automaticamente!
   * ```
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Verifica se a rota é pública (GET /produtos ou /api/products)
    const isPublicRoute = this.isPublicEndpoint(req);
    
    // Se for rota pública, não adiciona token
    if (isPublicRoute) {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => this.handleAuthError(error, req))
      );
    }

    // Para rotas privadas, adiciona token se existir
    const token = getToken();
    if (token) {
      const clonedRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => this.handleAuthError(error, req))
      );
    }

    // Se não tem token para rota privada, ainda tenta (backend retornará 401)
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => this.handleAuthError(error, req))
    );
  }

  /**
   * Verifica se o endpoint é público (não precisa de token)
   * Rotas públicas: GET /produtos, GET /produtos/:id, GET /api/products, GET /api/products/:id
   */
  private isPublicEndpoint(req: HttpRequest<any>): boolean {
    const url = req.url.toLowerCase();
    const method = req.method.toUpperCase();
    
    // Endpoints públicos: apenas GET de produtos
    if (method === 'GET') {
      return url.includes('/produtos') || url.includes('/api/products');
    }
    
    // Login é sempre público
    if (url.includes('/auth/login')) {
      return true;
    }
    
    return false;
  }

  private handleAuthError(error: HttpErrorResponse, req: HttpRequest<any>) {
    // Tratamento específico para erro 401
    if (error?.status === 401) {
      const isLoginAttempt = req.url.includes('/auth/login');
      
      if (isLoginAttempt) {
        // Se erro no login, deixa o componente tratar (senha incorreta)
        return throwError(() => error);
      }
      
      // Para outras rotas: sessão expirou
      console.warn('[AuthInterceptor] Sessão expirada ou sem permissão (401)');
      this.authService.logout();
      
      // Redireciona para dashboard (sem modo admin)
      if (typeof window !== 'undefined') {
        alert('⚠️ Sessão expirada ou sem permissão. Faça login novamente.');
        // Força reload para resetar estado
        window.location.href = '/dashboard';
      }
    }
    
    return throwError(() => error);
  }
}
