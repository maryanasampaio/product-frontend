/**
 * ============================================================================
 * AUTH REPOSITORY - CAMADA DE DADOS
 * ============================================================================
 *
 * RESPONSABILIDADE ÚNICA: Comunicação HTTP com a API
 *
 * O que este arquivo FAZ:
 * ✅ Envia requisições HTTP para o backend
 * ✅ Recebe respostas do backend
 * ✅ Retorna Observables (streams de dados assíncronos)
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';


@Injectable({
  providedIn: 'root'
})
export class AuthRepository {
 
  private apiUrl = environment.apiUrl;

  /**
   * CONSTRUTOR - Injeção de Dependências
   *
   * @param http - HttpClient do Angular para fazer requisições HTTP
   *
    */
  constructor(private http: HttpClient) {}

  /**
   *
   * @param credentials - Objeto com username e password
   * @returns Observable<LoginResponse> - Stream que emite a resposta quando chegar
   *
   * OBSERVABLE: É como uma "promessa turbinada" que pode emitir múltiplos valores
   * e pode ser cancelada. Faz parte do RxJS.
   */

  login(credentials: LoginRequest): Observable<LoginResponse> {
      const response = this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,  // URL: http://localhost:8080/auth/login
      credentials                    // Body: { username: '...', password: '...' }
    );
    return response;
  }

}
