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
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getToken } from '../utils/storage.util';

/**
 * @Injectable()
 *
 * Permite injetar este interceptor via Dependency Injection.
 * NÃO tem providedIn: 'root' porque interceptors são registrados de forma especial.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
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
    // 1. Pega o token JWT do localStorage
    // Retorna string ou null
    const token = getToken();

    // 2. Se existe token, adiciona no header Authorization
    if (token) {
      /**
       * HttpRequest é IMUTÁVEL (não pode ser modificado)
       *
       * Por isso usamos req.clone() para criar uma CÓPIA modificada
       *
       * .clone({ headers: ... }) - cria nova requisição com headers atualizados
       * .set('Authorization', `Bearer ${token}`) - adiciona header
       *
       * Formato do header:
       * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       *                ^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       *                tipo   token JWT
       *
       * "Bearer" é o esquema de autenticação padrão para JWT
       */
      const clonedRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });

      // 3. Passa a requisição MODIFICADA para o próximo handler
      // next.handle() continua a cadeia (pode ter outros interceptors)
      return next.handle(clonedRequest);
    }

    // 4. Se NÃO existe token, passa requisição ORIGINAL sem modificar
    // Útil para endpoints públicos que não precisam de autenticação (ex: /login)
    return next.handle(req);
  }
}
