# Taxas Infinity Pay - Link de Pagamento (Backend Validado)

Este arquivo registra as taxas confirmadas na implementacao do backend para simulacao.

## Regras de Calculo

Com repasse:

- `valor_cliente = amount / (1 - taxa)`
- `valor_retido = valor_cliente - amount`
- `net_amount = amount`

Sem repasse:

- `valor_cliente = amount`
- `valor_retido = amount * taxa`
- `net_amount = amount - valor_retido`

## Tabela de Taxas

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

## Exemplo Validado (2x com repasse)

- `amount = 1000.00`
- `taxa = 6.09%`
- `final_amount = 1064.85`
- `installment_value = 532.42`
- `operator_fee = 64.85`
- `net_amount = 1000.00`
