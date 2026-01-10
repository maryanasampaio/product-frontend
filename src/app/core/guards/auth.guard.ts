

import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

/**

  @param route - Informações da rota que está tentando acessar
  @param state - Estado do router (URL atual, params, etc.)
  @returns
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
 * 
 * export const routes: Routes = [
 *   { path: 'login', component: LoginComponent },
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [authGuard]  
 *   },
 *   {
 *     path: 'products',
 *     component: ProductsComponent,
 *     canActivate: [authGuard]  
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
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Em SSR (server), não há localStorage; trate como não autenticado
  // para evitar renderizar páginas protegidas no servidor e depois redirecionar no cliente.
  if (!isBrowser) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  /**
   * VERIFICAÇÃO DE AUTENTICAÇÃO
   *
   * authService.isAuthenticated() verifica se existe token no localStorage
   *
   * Se retorna true: Usuário está autenticado, pode prosseguir
   */
  if (authService.isAuthenticated()) {
    
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
  // Importante: em guards, retorne uma UrlTree em vez de chamar navigate.
  // Isso garante que o Router faça o redirecionamento dentro do ciclo de navegação.
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
