import { Routes } from '@angular/router';

export const routes: Routes = [
  // ============================================================================
  // ROTA RAIZ - REDIRECIONA PARA DASHBOARD
  // ============================================================================
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // ============================================================================
  // ROTAS PÚBLICAS (COM APP LAYOUT)
  // ============================================================================
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/products/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'produto/:id',
        loadComponent: () =>
          import('./features/products/pages/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
      }
    ]
  },

  // ============================================================================
  // ROTA DE GERENCIAMENTO FINANCEIRO
  // ============================================================================
  {
    path: 'gerenciamento',
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/management/pages/financial-dashboard/financial-dashboard.component').then((m) => m.FinancialDashboardComponent),
      }
    ]
  },

  // ============================================================================
  // ROTA DE CONFIGURAÇÕES
  // ============================================================================
  {
    path: 'configuracoes',
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/settings/pages/notifications-settings/notifications-settings.component').then((m) => m.NotificationsSettingsComponent),
      }
    ]
  },

  // ============================================================================
  // ROTA 404 (NÃO ENCONTRADA)
  // ============================================================================
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
