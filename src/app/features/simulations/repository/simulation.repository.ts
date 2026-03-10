import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SimulationRequest, SimulationResponse } from '../models/simulation.model';

/**
 * Repository para comunicação com API de simulações
 * Base: http://localhost:8080
 * POST /simulations/calculate - Calcular simulação de venda no cartão
 */
@Injectable({ providedIn: 'root' })
export class SimulationRepository {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  /**
   * Calcular simulação de venda no cartão
   * POST /simulations/calculate
   * 
   * Quando o backend estiver pronto, este método fará a chamada real.
   * Por enquanto, retornaremos um mock no service.
   */
  calculateSimulation(request: SimulationRequest): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(
      `${this.apiUrl}/simulations/calculate`,
      request
    );
  }

  /**
   * Buscar taxas disponíveis por bandeira
   * GET /simulations/rates/:card_brand
   * 
   * Endpoint opcional para o frontend consultar taxas
   */
  getCardRates(cardBrand: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/simulations/rates/${cardBrand}`);
  }

  /**
   * Salvar simulação no histórico (opcional)
   * POST /simulations/history
   */
  saveSimulationHistory(simulation: SimulationResponse): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulations/history`, simulation);
  }

  /**
   * Buscar histórico de simulações (opcional)
   * GET /simulations/history
   */
  getSimulationHistory(): Observable<SimulationResponse[]> {
    return this.http.get<SimulationResponse[]>(`${this.apiUrl}/simulations/history`);
  }
}
