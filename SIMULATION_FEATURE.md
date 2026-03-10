# Simulacao de Vendas no Cartao

Documento funcional da pagina `/simulacao` para implementacao backend.

## Objetivo

Padronizar os calculos com o modelo oficial de repasse por divisao (Link de Pagamento):

- `valor_cobrado_cliente = valor_liquido_desejado / (1 - taxa)`

Resultado esperado no cenario com repasse: o vendedor recebe exatamente o valor base informado.

## Escopo da Pagina

O frontend envia:

- `amount`: valor liquido desejado pela loja
- `installments`: numero de parcelas (1 a 12)
- `card_brand`: bandeira
- `repasse`: `true` (cliente paga taxa) ou `false` (loja absorve taxa)

O backend retorna os valores finais da simulacao.

## Regras Oficiais de Calculo

### 1. Com repasse (`repasse = true`)

- Cliente paga o valor ajustado para garantir liquido da loja.
- Loja recebe exatamente `amount`.

Formulas:

- `taxa = rate_percent / 100`
- `final_amount = amount / (1 - taxa)`
- `installment_value = final_amount / installments`
- `interest_total = final_amount - amount`
- `operator_fee = final_amount - amount`
- `net_amount = amount`

Observacao:

- no frontend atual, `operator_fee` pode continuar `0` para manter compatibilidade visual.
- para visao financeira completa no backend, recomenda-se retornar o valor real retido.

### 2. Sem repasse (`repasse = false`)

- Cliente paga o valor base.
- Loja absorve a taxa da operadora.

Formulas:

- `taxa = rate_percent / 100`
- `final_amount = amount`
- `installment_value = amount / installments`
- `operator_fee = amount * taxa`
- `net_amount = amount - operator_fee`
- `interest_total = 0`

## Exemplos de Referencia

### Exemplo A - validacao de formula (com repasse)

- `amount = 100.00`
- `rate_percent = 5.49`
- `final_amount = 100 / (1 - 0.0549) = 105.81`
- `operator_fee = 5.81`
- `net_amount = 100.00`

### Exemplo B - caso da pagina (com repasse em 2x)

- `amount = 1000.00`
- `installments = 2`
- `rate_percent = 6.09`
- `final_amount = 1000 / (1 - 0.0609) = 1064.85`
- `installment_value = 532.42`
- `operator_fee = 64.85`
- `net_amount = 1000.00`

## Contrato da API (alinhado ao frontend atual)

### Endpoint principal

- `POST /simulations/calculate`

Request:

```json
{
  "amount": 1000.0,
  "installments": 2,
  "card_brand": "visa",
  "repasse": true
}
```

Response (sem envelope `success/data`, pois o frontend atual espera objeto direto):

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

### Comparacao de cenarios

Nao e obrigatorio criar `POST /simulations/compare` no backend.
O frontend atual compara chamando `POST /simulations/calculate` duas vezes: uma com `repasse=true` e outra com `repasse=false`.

### Endpoints ativos no backend

- `POST /simulations/calculate` e `POST /api/simulations/calculate`
- `GET /card-brands` e `GET /api/card-brands`

### Tabela de taxas (Link de Pagamento)

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

## Validacoes Obrigatorias

- `amount > 0`
- `installments` inteiro entre `1` e `12`
- `card_brand` existente e ativo
- `repasse` booleano
- taxa da combinacao (`card_brand`, `installments`, `repasse`) deve existir
- `taxa < 100%` para evitar divisao por zero no repasse

Erros recomendados:

- `400 VALIDATION_ERROR`
- `404 RATE_NOT_FOUND`

## Modelo de Dados Sugerido

```sql
CREATE TABLE card_fee_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_brand VARCHAR(50) NOT NULL,
  installments INT NOT NULL,
  repasse BOOLEAN NOT NULL,
  rate_percent DECIMAL(5,2) NOT NULL COMMENT 'taxa percentual, ex: 6.09',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_rate (card_brand, installments, repasse)
);
```

## Pseudocodigo Oficial

```ts
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function simulate(amount: number, feePercent: number, installments: number, repasse: boolean) {
  const taxa = feePercent / 100;

  if (repasse) {
    const total = amount / (1 - taxa);
    return {
      base_amount: round2(amount),
      final_amount: round2(total),
      installment_value: round2(total / installments),
      interest_total: round2(total - amount),
      operator_fee: round2(total - amount),
      net_amount: round2(amount)
    };
  }

  const operatorFee = amount * taxa;
  return {
    base_amount: round2(amount),
    final_amount: round2(amount),
    installment_value: round2(amount / installments),
    interest_total: 0,
    operator_fee: round2(operatorFee),
    net_amount: round2(amount - operatorFee)
  };
}
```

## Integracao com Frontend

Quando o backend estiver pronto:

1. implementar `POST /simulations/calculate`
2. no frontend, alterar `useMockData = false` em `src/app/features/simulations/services/simulation.service.ts`
3. manter os nomes de campos da interface `SimulationResponse`

## Status

- Frontend: pronto
- Backend: pronto para implementar conforme este documento
