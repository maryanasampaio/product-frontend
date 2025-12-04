/**
 * ============================================================================
 * AUTH GUARD - PROTEÇÃO DE ROTAS
 * ============================================================================
 *
 * RESPONSABILIDADE: Proteger rotas que precisam de autenticação
 *
 * O que é um Guard?
 * - É um "porteiro" das rotas
 * - Decide se usuário pode ou não acessar uma rota
 * - Executa ANTES de carregar o component da rota
 *
 * Por que usar?
 * ✅ Impede usuários não autenticados de acessar áreas protegidas
 * ✅ Redireciona automaticamente para login
 * ✅ Melhora segurança (user não vê conteúdo sem permissão)
 * ✅ Melhora UX (evita errors 401 na UI)
 *
 * Tipos de Guards:
 * - CanActivate: Pode ativar a rota? (usado aqui)
 * - CanDeactivate: Pode sair da rota? (ex: formulário não salvo)
 * - CanLoad: Pode carregar módulo lazy? (otimização)
 *
 * ANALOGIA: É como a segurança de um prédio que só deixa entrar
 * quem tem crachá (token) válido.
 * ============================================================================
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * ========================================================================
 * AUTH GUARD - Função Guard Moderna (Functional Guard)
 * ========================================================================
 *
 * No Angular moderno (v15+), Guards são funções em vez de classes.
 *
 * CanActivateFn - Tipo do TypeScript para funções guard
 *
 * Esta função é chamada pelo Angular Router ANTES de ativar uma rota.
 *
 * @param route - Informações da rota que está tentando acessar
 * @param state - Estado do router (URL atual, params, etc.)
 * @returns
 *   - true: Permite acesso à rota
 *   - false: Bloqueia acesso
 *   - UrlTree: Redireciona para outra rota
 *
 * FLUXO:
 * 1. Usuário tenta acessar /dashboard
 * 2. Angular Router chama authGuard()
 * 3. Guard verifica se usuário está autenticado
 * 4. Se SIM: retorna true → usuário acessa dashboard
 * 5. Se NÃO: redireciona para /login → usuário precisa logar
 *
 * Como usar nas rotas:
 * ```typescript
 * // app.routes.ts
 * export const routes: Routes = [
 *   { path: 'login', component: LoginComponent },
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [authGuard]  // ← Rota protegida!
 *   },
 *   {
 *     path: 'products',
 *     component: ProductsComponent,
 *     canActivate: [authGuard]  // ← Também protegida!
 *   }
 * ];
 * ```
 *
 * Cenários:
 *
 * 1. Usuário AUTENTICADO tentando acessar /dashboard:
 *    - authGuard() retorna true
 *    - Usuário vê a página dashboard ✅
 *
 * 2. Usuário NÃO AUTENTICADO tentando acessar /dashboard:
 *    - authGuard() retorna false
 *    - Angular redireciona para /login
 *    - Usuário precisa fazer login primeiro ❌
 *
 * 3. Após login bem-sucedido:
 *    - Token é salvo
 *    - authGuard() agora retorna true
 *    - Usuário consegue acessar rotas protegidas ✅
 */
export const authGuard: CanActivateFn = (route, state) => {
  /**
   * inject() - Nova forma de fazer Dependency Injection em funções
   *
   * No Angular moderno, guards são funções (não classes).
   * Usamos inject() para pegar instâncias de serviços.
   *
   * Equivalente a ter no construtor:
   * constructor(private authService: AuthService) {}
   */
  const authService = inject(AuthService);
  const router = inject(Router);

  /**
   * VERIFICAÇÃO DE AUTENTICAÇÃO
   *
   * authService.isAuthenticated() verifica se existe token no localStorage
   *
   * Se retorna true: Usuário está autenticado, pode prosseguir
   */
  if (authService.isAuthenticated()) {
    // ✅ AUTORIZADO: Permite acesso à rota
    return true;
  }

  /**
   * REDIRECIONAMENTO PARA LOGIN
   *
   * Se chegou aqui, usuário NÃO está autenticado.
   *
   * router.navigate(['/login'], { ... })
   * - Redireciona para a página de login
   *
   * queryParams: { returnUrl: state.url }
   * - Salva a URL que o usuário tentou acessar
   * - Após login, pode redirecionar de volta para esta URL
   *
   * Exemplo:
   * - Usuário tenta acessar /dashboard
   * - Guard redireciona para /login?returnUrl=/dashboard
   * - Após login, AuthService pode ler returnUrl e redirecionar para /dashboard
   *
   * state.url - URL completa que o usuário tentou acessar
   */
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  // ❌ BLOQUEADO: Não permite acesso à rota
  return false;
};
