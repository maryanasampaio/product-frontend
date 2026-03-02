import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Serviço para gerenciar modo Admin com login backend
 * 
 * Uso:
 * - Usuário comum: acessa normalmente
 * - Admin: faz triple-click na logo e faz login no backend
 * - O estado persiste no localStorage até limpar ou desativar
 */
@Injectable({
  providedIn: 'root'
})
export class AdminModeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly isAdminSubject = new BehaviorSubject<boolean>(false);
  public isAdmin$: Observable<boolean> = this.isAdminSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Carrega estado inicial verificando se está autenticado
      const isAuthenticated = this.authService.isAuthenticated();
      if (isAuthenticated) {
        this.isAdminSubject.next(true);
      }
    }
  }

  /**
   * Ativa o modo admin fazendo login no backend
   * Retorna Observable para o component tratar
   */
  enableAdminMode(): Observable<any> {
    return new Observable(observer => {
      this.authService.login('admin', '123456').subscribe({
        next: (response) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('isAdminMode', 'true');
            this.isAdminSubject.next(true);
          }
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('[AdminModeService] Erro ao fazer login:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Desativa o modo admin e faz logout do backend
   */
  disableAdminMode(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isAdminMode');
      this.authService.logout();
      this.isAdminSubject.next(false);
    }
  }

  /**
   * Retorna o estado atual do modo admin (síncrono)
   */
  isAdminMode(): boolean {
    return this.isAdminSubject.value;
  }

  /**
   * Alterna entre modo admin e modo comum
   */
  toggleAdminMode(): Observable<any> | void {
    if (this.isAdminMode()) {
      this.disableAdminMode();
      return;
    } else {
      return this.enableAdminMode();
    }
  }
}
