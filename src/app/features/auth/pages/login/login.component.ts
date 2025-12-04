/**
 * LOGIN COMPONENT
 *
 * Responsabilidade: Interface de login
 * - Captura username e password
 * - Valida campos vazios
 * - Chama AuthService.login()
 * - Exibe loading e erros
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // Estados locais da feature
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    // Validação de campos vazios
    if (!this.username || !this.password) {
      this.errorMessage = 'Preencha todos os campos';
      return;
    }

    // Inicia loading e limpa erro
    this.isLoading = true;
    this.errorMessage = '';

    // Chama service de autenticação
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        // AuthService já redirecionou para /dashboard
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Erro ao fazer login';
      }
    });
  }
}
