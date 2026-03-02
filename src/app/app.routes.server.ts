import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Não renderizar dashboard e produtos no servidor para evitar mismatch/hidratação duplicada
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dashboard/produto/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'gerenciamento',
    renderMode: RenderMode.Client,
  },
  {
    path: 'configuracoes',
    renderMode: RenderMode.Client,
  },
  // Demais rotas podem ser prerenderizadas
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
