export interface SimulationRequest {
  amount: number;
  installments: number;
  card_brand: string;
  repasse: boolean;
}

export interface SimulationResponse {
  base_amount: number;
  final_amount: number;
  installment_value: number;
  interest_total: number;
  operator_fee: number;
  net_amount: number;
  repasse: boolean;
  card_brand: string;
  installments: number;
}

export interface CardBrand {
  id: string;
  name: string;
  icon?: string;
}

export interface SimulationState {
  amount: number;
  installments: number;
  selectedCard: string;
  repasse: boolean;
  result: SimulationResponse | null;
  loading: boolean;
  error: string | null;
}

export interface CardFeeRate {
  card_brand: string;
  installments_from: number;
  installments_to: number;
  monthly_rate: number;
}
