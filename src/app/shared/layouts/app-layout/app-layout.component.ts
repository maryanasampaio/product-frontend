/**
 * APP LAYOUT COMPONENT
 *
 * Layout para páginas internas da aplicação (após login)
 *
 * RESPONSABILIDADE:
 * - Exibir navbar/header
 * - Exibir sidebar (se necessário)
 * - Aplicar padding/margin padrão
 * - Renderizar conteúdo das rotas protegidas
 *
 * ONDE USA:
 * - /dashboard
 * - /products
 * - /profile
 * - Todas rotas protegidas
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- HEADER/NAVBAR (adicionar futuramente) -->
      <!-- <app-navbar /> -->

      <!-- CONTEÚDO PRINCIPAL -->
      <main class="container mx-auto px-4 py-8">
        <router-outlet />
      </main>

      <!-- FOOTER (opcional) -->
      <!-- <app-footer /> -->
    </div>
  `
})
export class AppLayoutComponent {}
