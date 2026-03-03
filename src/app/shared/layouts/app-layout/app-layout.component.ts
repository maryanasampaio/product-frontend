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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../../core/services/sidebar.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- SIDEBAR (sempre presente, abre/fecha) -->
      <app-sidebar />

      <!-- OVERLAY MOBILE (apenas mobile) -->
      <div 
        *ngIf="isSidebarOpen"
        (click)="closeSidebar()"
        class="fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden">
      </div>

      <!-- CONTEÚDO PRINCIPAL -->
      <main 
        class="flex-1 transition-all duration-300 ease-in-out"
        [class.lg:ml-64]="isSidebarOpen"
        [class.ml-0]="!isSidebarOpen">
        <router-outlet />
      </main>
    </div>
  `
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = false;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sidebarService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isSidebarOpen = isOpen;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeSidebar(): void {
    this.sidebarService.close();
  }
}
