/**
 * DASHBOARD COMPONENT
 *
 * Página inicial após login
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="bg-white rounded-lg shadow-md p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <p class="text-gray-600">Bem-vindo ao sistema!</p>
    </div>
  `
})
export class DashboardComponent {}
