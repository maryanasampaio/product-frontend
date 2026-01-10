import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Guard de Permissão
 * Usa claim "permission" do JWT, ex.: 'ADMIN' ou 'USER'.
 * Configure a rota com data: { requiredPermission: 'ADMIN' }.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Lê permissão requerida da rota
  const required = route.data?.['requiredPermission'] as string | undefined;
  if (!required) {
    // Sem configuração, permite acesso
    return true;
  }

  // No SSR, bloqueia acesso a rotas restritas e retorna para dashboard
  if (!isBrowser) {
    return router.createUrlTree(['/dashboard']);
  }

  // No cliente, valida permissão
  if (authService.hasPermission(required)) {
    return true;
  }

  // Sem permissão, redireciona para dashboard
  return router.createUrlTree(['/dashboard']);
};
