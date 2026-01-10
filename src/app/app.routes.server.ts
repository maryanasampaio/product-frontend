import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Não renderizar dashboard no servidor para evitar mismatch/hidratação duplicada
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  // Demais rotas podem ser prerenderizadas
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
