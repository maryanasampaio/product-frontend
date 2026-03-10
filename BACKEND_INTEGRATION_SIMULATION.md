# Backend Integration - Simulacao de Vendas no Cartao

Este documento define o contrato final para implementar o backend da pagina de simulacao com o modelo Infinity (repasse por divisao).

## 1. Regra central

Com repasse, a taxa incide sobre o valor cobrado do cliente. Para garantir liquido exato da loja:

- `valor_cliente = valor_liquido_desejado / (1 - taxa)`

Onde:

- `valor_liquido_desejado` = `amount` enviado pelo frontend
- `taxa` = percentual convertido para decimal (`rate_percent / 100`)

## 2. Entradas da simulacao

Payload recebido em `POST /simulations/calculate`:

```json
{
  "amount": 1000.0,
  "installments": 2,
  "card_brand": "visa",
  "repasse": true
}
```

Campos:

- `amount`: number > 0
- `installments`: integer entre 1 e 12
- `card_brand`: string (bandeira valida)
- `repasse`: boolean

## 3. Saida esperada (contrato do frontend)

O frontend atual espera objeto direto (sem envelope `success/data`):

```json
{
  "base_amount": 1000.0,
  "final_amount": 1064.85,
  "installment_value": 532.42,
  "interest_total": 64.85,
  "operator_fee": 64.85,
  "net_amount": 1000.0,
  "repasse": true,
  "card_brand": "visa",
  "installments": 2
}
```

## 4. Formulas oficiais

### 4.1 Com repasse (`repasse = true`)

- `taxa = rate_percent / 100`
- `final_amount = amount / (1 - taxa)`
- `installment_value = final_amount / installments`
- `interest_total = final_amount - amount`
- `operator_fee = final_amount - amount`
- `net_amount = amount`

### 4.2 Sem repasse (`repasse = false`)

- `taxa = rate_percent / 100`
- `final_amount = amount`
- `installment_value = amount / installments`
- `operator_fee = amount * taxa`
- `net_amount = amount - operator_fee`
- `interest_total = 0`

## 5. Exemplos validados

### Exemplo A - Repasse com 5.49%

Entrada:

- `amount = 100.00`
- `rate_percent = 5.49`
- `installments = 1`

Resultado:

- `final_amount = 105.81`
- `operator_fee = 5.81`
- `net_amount = 100.00`

### Exemplo B - Repasse com 6.09% em 2x

Entrada:

- `amount = 1000.00`
- `rate_percent = 6.09`
- `installments = 2`

Resultado:

- `final_amount = 1064.85`
- `installment_value = 532.42`
- `operator_fee = 64.85`
- `net_amount = 1000.00`

## 6. Banco de dados sugerido

### 6.1 Bandeiras

```sql
CREATE TABLE card_brands (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6.2 Taxas por cenario

```sql
CREATE TABLE card_fee_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_brand VARCHAR(50) NOT NULL,
  installments INT NOT NULL,
  repasse BOOLEAN NOT NULL,
  rate_percent DECIMAL(5,2) NOT NULL COMMENT 'Ex: 6.09',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_rate (card_brand, installments, repasse),
  FOREIGN KEY (card_brand) REFERENCES card_brands(id)
);
```

### 6.3 Seed minimo inicial

```sql
INSERT INTO card_brands (id, name) VALUES
  ('visa', 'Visa'),
  ('mastercard', 'Mastercard'),
  ('elo', 'Elo'),
  ('amex', 'American Express'),
  ('hipercard', 'Hipercard');

-- Exemplo inicial baseado no caso validado de 2x com repasse
INSERT INTO card_fee_rates (card_brand, installments, repasse, rate_percent) VALUES
  ('visa', 1, TRUE, 0.00),
  ('visa', 1, FALSE, 0.00),
  ('visa', 2, TRUE, 6.09),
  ('visa', 2, FALSE, 6.09);
```

Tabela validada no backend (Link de Pagamento):

- `1x`: `4.20%`
- `2x`: `6.09%`
- `3x`: `7.01%`
- `4x`: `7.91%`
- `5x`: `8.80%`
- `6x`: `9.67%`
- `7x`: `12.59%`
- `8x`: `13.42%`
- `9x`: `14.25%`
- `10x`: `15.06%`
- `11x`: `15.87%`
- `12x`: `16.66%`

## 7. Endpoints necessarios

### 7.1 POST /simulations/calculate

Responsavel por retornar uma simulacao unica.

Rotas disponiveis:

- `/simulations/calculate`
- `/api/simulations/calculate`

Erros esperados:

- `400 VALIDATION_ERROR`
- `404 RATE_NOT_FOUND`
- `500 INTERNAL_ERROR`

### 7.2 GET /card-brands (opcional recomendado)

Retorna bandeiras ativas para alimentar dropdown.

Rotas disponiveis:

- `/card-brands`
- `/api/card-brands`

## 8. Endpoint de comparacao

Nao e obrigatorio no backend.

A tela atual compara cenarios chamando `POST /simulations/calculate` duas vezes:

- `repasse = true`
- `repasse = false`

## 9. Regras de validacao

- `amount` obrigatorio e maior que zero
- `installments` inteiro entre 1 e 12
- `card_brand` existente e ativa
- `repasse` booleano
- taxa para combinacao (`card_brand`, `installments`, `repasse`) deve existir
- `rate_percent` menor que 100 para evitar divisao por zero

## 10. Pseudocodigo de referencia

```ts
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function simulate(
  amount: number,
  installments: number,
  feePercent: number,
  repasse: boolean,
  cardBrand: string
) {
  const taxa = feePercent / 100;

  if (repasse) {
    const finalAmount = amount / (1 - taxa);
    const operatorFee = finalAmount - amount;

    return {
      base_amount: round2(amount),
      final_amount: round2(finalAmount),
      installment_value: round2(finalAmount / installments),
      interest_total: round2(operatorFee),
      operator_fee: round2(operatorFee),
      net_amount: round2(amount),
      repasse: true,
      card_brand: cardBrand,
      installments
    };
  }

  const operatorFee = amount * taxa;

  return {
    base_amount: round2(amount),
    final_amount: round2(amount),
    installment_value: round2(amount / installments),
    interest_total: 0,
    operator_fee: round2(operatorFee),
    net_amount: round2(amount - operatorFee),
    repasse: false,
    card_brand: cardBrand,
    installments
  };
}
```

## 11. Alinhamento final com frontend

Arquivo consumidor da API:

- `src/app/features/simulations/repository/simulation.repository.ts`

Checklist:

- endpoint implementado em `/simulations/calculate`
- response no formato `SimulationResponse` (objeto direto)
- CORS liberado para frontend
- no frontend, ativar backend alterando `useMockData = false` em `src/app/features/simulations/services/simulation.service.ts`
