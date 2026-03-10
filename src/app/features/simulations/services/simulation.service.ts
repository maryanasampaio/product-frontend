import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  SimulationRequest,
  SimulationResponse,
  CardBrand,
  CardFeeRate,
} from '../models/simulation.model';
import { SimulationRepository } from '../repository/simulation.repository';

/**
 * Service para gerenciar simulações de venda no cartão
 * 
 * MODO ATUAL: Cálculos mockados no frontend
 * MODO PRODUÇÃO: Delegar cálculos para o backend
 */
@Injectable({ providedIn: 'root' })
export class SimulationService {
  private useMockData = false; // Backend implementado: usar API real por padrao

  // Bandeiras de cartão disponíveis
  private readonly cardBrands: CardBrand[] = [
    { id: 'visa', name: 'Visa' },
    { id: 'mastercard', name: 'Mastercard' },
    { id: 'elo', name: 'Elo' },
    { id: 'amex', name: 'American Express' },
    { id: 'hipercard', name: 'Hipercard' },
  ];

  // Taxas mockadas (%) para Link de Pagamento (Infinity), alinhadas ao backend.
  private readonly mockRates: CardFeeRate[] = this.cardBrands.flatMap((brand) => [
    { card_brand: brand.id, installments_from: 1, installments_to: 1, monthly_rate: 4.2 },
    { card_brand: brand.id, installments_from: 2, installments_to: 2, monthly_rate: 6.09 },
    { card_brand: brand.id, installments_from: 3, installments_to: 3, monthly_rate: 7.01 },
    { card_brand: brand.id, installments_from: 4, installments_to: 4, monthly_rate: 7.91 },
    { card_brand: brand.id, installments_from: 5, installments_to: 5, monthly_rate: 8.8 },
    { card_brand: brand.id, installments_from: 6, installments_to: 6, monthly_rate: 9.67 },
    { card_brand: brand.id, installments_from: 7, installments_to: 7, monthly_rate: 12.59 },
    { card_brand: brand.id, installments_from: 8, installments_to: 8, monthly_rate: 13.42 },
    { card_brand: brand.id, installments_from: 9, installments_to: 9, monthly_rate: 14.25 },
    { card_brand: brand.id, installments_from: 10, installments_to: 10, monthly_rate: 15.06 },
    { card_brand: brand.id, installments_from: 11, installments_to: 11, monthly_rate: 15.87 },
    { card_brand: brand.id, installments_from: 12, installments_to: 12, monthly_rate: 16.66 },
  ]);

  constructor(private readonly repository: SimulationRepository) {}

  /**
   * Retorna as bandeiras de cartão disponíveis
   */
  getCardBrands(): CardBrand[] {
    return this.cardBrands;
  }

  /**
   * Calcula a simulação de venda no cartão
   * 
   * Se useMockData = true: calcula no frontend (temporário)
   * Se useMockData = false: chama o backend (produção)
   */
  calculate(request: SimulationRequest): Observable<SimulationResponse> {
    if (this.useMockData) {
      return this.calculateMock(request);
    }
    
    // Chamada real ao backend (quando estiver pronto)
    return this.repository.calculateSimulation(request);
  }

  /**
   * Cálculo mockado no frontend (temporário)
   * 
   * IMPORTANTE: Em produção, esta lógica deve estar no BACKEND
   */
  private calculateMock(request: SimulationRequest): Observable<SimulationResponse> {
    const { amount, installments, card_brand, repasse } = request;

    // Buscar taxa (%) para a bandeira e número de parcelas
    const rate = this.getRate(card_brand, installments);
    const fee = rate / 100;
    
    let response: SimulationResponse;

    if (repasse) {
      // COM REPASSE (Infinity):
      // valorCliente = valorBase ÷ (1 - taxa)
      // parcela = valorCliente ÷ parcelas
      // líquido vendedor = valorBase
      // valor retido = valorCliente - valorBase
      const finalAmount = amount / (1 - fee);
      const installmentValue = finalAmount / installments;
      const interestTotal = finalAmount - amount;
      
      const operatorFee = interestTotal;

      response = {
        base_amount: amount,
        final_amount: Math.round(finalAmount * 100) / 100,
        installment_value: Math.round(installmentValue * 100) / 100,
        interest_total: Math.round(interestTotal * 100) / 100,
        operator_fee: Math.round(operatorFee * 100) / 100,
        net_amount: amount, // Vendedor recebe valor base
        repasse: true,
        card_brand,
        installments,
      };
    } else {
      // SEM REPASSE:
      // valorCliente = valorBase
      // valorRetido = valorBase × taxa
      // valorLiquidoLoja = valorBase - valorRetido
      // parcela = valorBase ÷ parcelas
      const installmentValue = amount / installments;
      const operatorFee = amount * fee;
      const netAmount = amount - operatorFee;
      
      response = {
        base_amount: amount,
        final_amount: amount, // Cliente paga o valor base
        installment_value: Math.round(installmentValue * 100) / 100,
        interest_total: 0, // Cliente não paga juros
        operator_fee: Math.round(operatorFee * 100) / 100,
        net_amount: Math.round(netAmount * 100) / 100,
        repasse: false,
        card_brand,
        installments,
      };
    }

    // Simula delay de rede
    return of(response).pipe(delay(300));
  }

  /**
   * Busca a taxa para uma bandeira e número de parcelas
   */
  private getRate(cardBrand: string, installments: number): number {
    const rate = this.mockRates.find(
      (r) =>
        r.card_brand === cardBrand &&
        installments >= r.installments_from &&
        installments <= r.installments_to
    );

    return rate ? rate.monthly_rate : 0;
  }

  /**
   * Compara dois cenários: com repasse vs sem repasse
   */
  compareScenarios(
    amount: number,
    installments: number,
    cardBrand: string
  ): Observable<{ withRepasse: SimulationResponse; withoutRepasse: SimulationResponse }> {
    const withRepasse = this.calculate({
      amount,
      installments,
      card_brand: cardBrand,
      repasse: true,
    });

    const withoutRepasse = this.calculate({
      amount,
      installments,
      card_brand: cardBrand,
      repasse: false,
    });

    return new Observable((observer) => {
      let with_repasse_result: SimulationResponse;
      let without_repasse_result: SimulationResponse;
      let completed = 0;

      withRepasse.subscribe((result) => {
        with_repasse_result = result;
        completed++;
        if (completed === 2) {
          observer.next({
            withRepasse: with_repasse_result,
            withoutRepasse: without_repasse_result,
          });
          observer.complete();
        }
      });

      withoutRepasse.subscribe((result) => {
        without_repasse_result = result;
        completed++;
        if (completed === 2) {
          observer.next({
            withRepasse: with_repasse_result,
            withoutRepasse: without_repasse_result,
          });
          observer.complete();
        }
      });
    });
  }

  /**
   * Habilita/desabilita o modo mock
   */
  setMockMode(enabled: boolean): void {
    this.useMockData = enabled;
  }
}
