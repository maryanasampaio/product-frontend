import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ============================================================================
  // ROTAS DE AUTENTICAÇÃO (SEM PROTEÇÃO)
  // ============================================================================
  // Usa AuthLayoutComponent para centralizar conteúdo
  {
    path: '',
    loadComponent: () =>
      import('./shared/layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
      }
    ]
  },

  // ============================================================================
  // ROTAS PROTEGIDAS (REQUEREM AUTENTICAÇÃO)
  // ============================================================================
  // Usa AppLayoutComponent com navbar/header
  {
    path: '',
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    canActivate: [authGuard], // ← Protege todas rotas filhas
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/products/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      }
      // Adicione aqui outras rotas protegidas:
      // { path: 'products', loadComponent: ... },
      // { path: 'profile', loadComponent: ... },
    ]
  },

  // ============================================================================
  // ROTA 404 (NÃO ENCONTRADA)
  // ============================================================================
  {
    path: '**',
    redirectTo: 'login'
  }
];
