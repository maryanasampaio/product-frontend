import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      (click)="onClose()">
      
      <div 
        class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Acesso Admin</h2>
          <button 
            (click)="onClose()"
            class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Senha de Administrador
            </label>
            <input 
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Digite a senha secreta"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              autofocus>
          </div>

          <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {{ errorMessage }}
          </div>

          <button 
            type="submit"
            class="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all">
            Entrar como Admin
          </button>
        </form>

        <!-- Hint (remover em produção) -->
        <div class="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
          💡 Dica dev: senha é "utillar2026"
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLoginModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() adminAuthenticated = new EventEmitter<void>();

  password = '';
  errorMessage = '';
  
  // Senha secreta (em produção, isso viria de um backend seguro)
  private readonly SECRET_PASSWORD = 'utillar2026';

  onSubmit(): void {
    if (this.password === this.SECRET_PASSWORD) {
      this.adminAuthenticated.emit();
      this.onClose();
    } else {
      this.errorMessage = 'Senha incorreta. Tente novamente.';
      this.password = '';
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
