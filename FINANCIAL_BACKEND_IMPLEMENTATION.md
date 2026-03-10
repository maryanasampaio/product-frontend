# 📊 Documentação: Implementação de Endpoints Financeiros - Backend

## 🎯 Objetivo

Otimizar o **Dashboard Financeiro** movendo os cálculos pesados do frontend para o backend, melhorando performance e escalabilidade.

---

## 📋 Situação Atual vs. Ideal

### Atual (Frontend-Heavy)
```
Frontend busca TODOS os produtos → Filtra por disponivel → Calcula 6 métricas localmente
📦 Dados transferidos: ~500KB (500 produtos)
⏱️ Tempo de processamento: 2-3 segundos
⚠️ Limite de escala: ~1.000 produtos
```

### Ideal (Backend-Heavy)
```
Backend calcula métricas → Frontend recebe dados prontos
📦 Dados transferidos: ~2KB
⏱️ Tempo de processamento: 50-100ms
✅ Escala: Milhares de produtos
```

---

## 🏗️ Arquitetura Proposta

### 1. Estrutura de Pacotes
```
com.seuapp.backend/
├── controller/
│   └── FinancialController.java
├── service/
│   └── FinancialService.java
├── repository/
│   ├── ProductRepository.java
│   └── FinancialRepository.java
├── dto/
│   ├── DashboardMetricsDTO.java
│   ├── MonthlyStatsDTO.java
│   ├── TopProductDTO.java
│   └── StockMetricsDTO.java
└── model/
    └── Product.java
```

---

## 📡 Endpoints Necessários

### 1️⃣ **GET** `/api/financeiro/resumo-mes-atual`
**Prioridade: ALTA** ⭐⭐⭐

Retorna métricas consolidadas do mês atual.

#### Response Body (JSON)
```json
{
  "currentMonthProfit": 125000,
  "currentMonthSales": 350000,
  "currentMonthCost": 225000,
  "currentMonthMargin": 35.7,
  "itemsSold": 42,
  "ticketMedio": 8333,
  "topSellingProduct": "Produto X",
  "profitVariation": 12.5
}
```

#### Campos
| Campo | Tipo | Descrição | Unidade |
|-------|------|-----------|---------|
| `currentMonthProfit` | Integer | Lucro do mês atual | centavos |
| `currentMonthSales` | Integer | Vendas totais do mês | centavos |
| `currentMonthCost` | Integer | Custo total do mês | centavos |
| `currentMonthMargin` | Double | Margem de lucro (%) | percentual |
| `itemsSold` | Integer | Quantidade vendida | unidades |
| `ticketMedio` | Integer | Ticket médio | centavos |
| `topSellingProduct` | String | Produto mais vendido | texto |
| `profitVariation` | Double | Variação vs mês anterior (%) | percentual |

---

### 2️⃣ **GET** `/api/financeiro/metricas-gerais`
**Prioridade: ALTA** ⭐⭐⭐

Retorna métricas históricas totais.

#### Response Body (JSON)
```json
{
  "totalProfit": 580000,
  "totalSalesAmount": 1450000,
  "totalItemsSold": 187,
  "margemMedia": 40.0
}
```

---

### 3️⃣ **GET** `/api/financeiro/evolucao-mensal?meses=6`
**Prioridade: MÉDIA** ⭐⭐

Retorna evolução dos últimos N meses (padrão: 6).

#### Query Parameters
- `meses` (optional): Número de meses a retornar (default: 6)

#### Response Body (JSON)
```json
{
  "months": [
    {
      "month": "fevereiro de 2026",
      "monthKey": "2026-02",
      "totalSales": 350000,
      "totalCost": 225000,
      "profit": 125000,
      "itemsSold": 42,
      "margin": 35.7
    },
    {
      "month": "janeiro de 2026",
      "monthKey": "2026-01",
      "totalSales": 280000,
      "totalCost": 180000,
      "profit": 100000,
      "itemsSold": 35,
      "margin": 35.7
    }
  ],
  "maxMonthProfit": 125000
}
```

---

### 4️⃣ **GET** `/api/financeiro/produtos-top?limit=3`
**Prioridade: MÉDIA** ⭐⭐

Retorna os produtos mais vendidos (histórico completo).

#### Query Parameters
- `limit` (optional): Quantidade de produtos (default: 3)

#### Response Body (JSON)
```json
{
  "topProducts": [
    {
      "name": "Produto A",
      "timesSold": 23,
      "totalRevenue": 460000,
      "margin": 42.5
    },
    {
      "name": "Produto B",
      "timesSold": 18,
      "totalRevenue": 360000,
      "margin": 38.2
    }
  ]
}
```

---

### 5️⃣ **GET** `/api/financeiro/estoque`
**Prioridade: BAIXA** ⭐

Retorna métricas de estoque atual.

#### Response Body (JSON)
```json
{
  "stockCount": 87,
  "stockValue": 1250000,
  "stockPotentialValue": 2100000,
  "stockPotentialProfit": 850000,
  "oldStockCount": 12
}
```

#### Lógica de `oldStockCount`
Produtos considerados "parados":
- `disponivel = 1` (em estoque)
- `stock < 2` (estoque baixo)

---

### 6️⃣ **GET** `/api/financeiro/produtos-baixa-margem?limit=5`
**Prioridade: BAIXA** ⭐

Retorna produtos em estoque com menor margem de lucro.

#### Response Body (JSON)
```json
{
  "lowMarginProducts": [
    {
      "id": 42,
      "name": "Produto C",
      "category": "Categoria X",
      "price": 15000,
      "costPrice": 13500,
      "margin": 10.0
    }
  ]
}
```

---

## 💾 DTOs (Data Transfer Objects)

### DashboardMetricsDTO.java
```java
package com.seuapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardMetricsDTO {
    private Integer currentMonthProfit;      // centavos
    private Integer currentMonthSales;       // centavos
    private Integer currentMonthCost;        // centavos
    private Double currentMonthMargin;       // percentual
    private Integer itemsSold;               // unidades
    private Integer ticketMedio;             // centavos
    private String topSellingProduct;        // nome do produto
    private Double profitVariation;          // percentual
}
```

### MonthlyStatsDTO.java
```java
package com.seuapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyStatsDTO {
    private String month;          // "fevereiro de 2026"
    private String monthKey;       // "2026-02"
    private Integer totalSales;    // centavos
    private Integer totalCost;     // centavos
    private Integer profit;        // centavos
    private Integer itemsSold;     // unidades
    private Double margin;         // percentual
}
```

### TopProductDTO.java
```java
package com.seuapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProductDTO {
    private String name;
    private Integer timesSold;
    private Integer totalRevenue;  // centavos
    private Double margin;         // percentual
}
```

### StockMetricsDTO.java
```java
package com.seuapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockMetricsDTO {
    private Integer stockCount;
    private Integer stockValue;           // centavos
    private Integer stockPotentialValue;  // centavos
    private Integer stockPotentialProfit; // centavos
    private Integer oldStockCount;
}
```

---

## 🗄️ Queries SQL

### 1. Resumo do Mês Atual
```sql
-- Métricas do mês atual
SELECT 
    COUNT(*) as items_sold,
    SUM(price) as total_sales,
    SUM(cost_price) as total_cost,
    SUM(price - cost_price) as profit,
    ROUND(SUM(price - cost_price) / SUM(price) * 100, 1) as margin
FROM products
WHERE disponivel = 0
  AND YEAR(sold_date) = YEAR(CURDATE())
  AND MONTH(sold_date) = MONTH(CURDATE());

-- Ticket médio
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN SUM(price) / COUNT(*)
        ELSE 0 
    END as ticket_medio
FROM products
WHERE disponivel = 0
  AND YEAR(sold_date) = YEAR(CURDATE())
  AND MONTH(sold_date) = MONTH(CURDATE());

-- Produto mais vendido do mês
SELECT name, COUNT(*) as sales_count
FROM products
WHERE disponivel = 0
  AND YEAR(sold_date) = YEAR(CURDATE())
  AND MONTH(sold_date) = MONTH(CURDATE())
GROUP BY name
ORDER BY sales_count DESC
LIMIT 1;

-- Variação de lucro vs mês anterior
SELECT 
    (SELECT SUM(price - cost_price) 
     FROM products 
     WHERE disponivel = 0 
       AND YEAR(sold_date) = YEAR(CURDATE()) 
       AND MONTH(sold_date) = MONTH(CURDATE())) as current_profit,
    (SELECT SUM(price - cost_price) 
     FROM products 
     WHERE disponivel = 0 
       AND YEAR(sold_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
       AND MONTH(sold_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) as last_profit;
```

### 2. Evolução Mensal (6 meses)
```sql
SELECT 
    DATE_FORMAT(sold_date, '%Y-%m') as month_key,
    DATE_FORMAT(sold_date, '%M de %Y') as month_display,
    COUNT(*) as items_sold,
    SUM(price) as total_sales,
    SUM(cost_price) as total_cost,
    SUM(price - cost_price) as profit,
    ROUND(SUM(price - cost_price) / SUM(price) * 100, 1) as margin
FROM products
WHERE disponivel = 0
  AND sold_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(sold_date, '%Y-%m')
ORDER BY month_key DESC;
```

### 3. Top Produtos
```sql
SELECT 
    name,
    COUNT(*) as times_sold,
    SUM(price) as total_revenue,
    ROUND(AVG((price - cost_price) / price * 100), 1) as margin
FROM products
WHERE disponivel = 0
GROUP BY name
ORDER BY total_revenue DESC
LIMIT 3;
```

### 4. Métricas de Estoque
```sql
-- Estoque atual
SELECT 
    COUNT(*) as stock_count,
    SUM(cost_price) as stock_value,
    SUM(price) as stock_potential_value,
    SUM(price - cost_price) as stock_potential_profit
FROM products
WHERE disponivel = 1;

-- Produtos parados (estoque baixo)
SELECT COUNT(*) as old_stock_count
FROM products
WHERE disponivel = 1 
  AND stock < 2;
```

### 5. Produtos com Baixa Margem
```sql
SELECT 
    id,
    name,
    category,
    price,
    cost_price,
    ROUND((price - cost_price) / price * 100, 1) as margin
FROM products
WHERE disponivel = 1
  AND cost_price > 0
ORDER BY margin ASC
LIMIT 5;
```

---

## 🛠️ Service Layer

### FinancialService.java
```java
package com.seuapp.backend.service;

import com.seuapp.backend.dto.*;
import com.seuapp.backend.repository.FinancialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class FinancialService {
    
    private final FinancialRepository financialRepository;
    private static final Locale PT_BR = new Locale("pt", "BR");

    /**
     * Retorna métricas do mês atual
     */
    public DashboardMetricsDTO getCurrentMonthMetrics() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        
        // Buscar métricas do mês atual
        Object[] currentMetrics = financialRepository.getCurrentMonthMetrics(year, month);
        
        // Buscar métricas do mês anterior para variação
        LocalDate lastMonth = now.minusMonths(1);
        Object[] lastMetrics = financialRepository.getCurrentMonthMetrics(
            lastMonth.getYear(), 
            lastMonth.getMonthValue()
        );
        
        DashboardMetricsDTO dto = new DashboardMetricsDTO();
        
        if (currentMetrics != null) {
            dto.setItemsSold(((Number) currentMetrics[0]).intValue());
            dto.setCurrentMonthSales(((Number) currentMetrics[1]).intValue());
            dto.setCurrentMonthCost(((Number) currentMetrics[2]).intValue());
            dto.setCurrentMonthProfit(((Number) currentMetrics[3]).intValue());
            dto.setCurrentMonthMargin(((Number) currentMetrics[4]).doubleValue());
            
            // Calcular ticket médio
            if (dto.getItemsSold() > 0) {
                dto.setTicketMedio(dto.getCurrentMonthSales() / dto.getItemsSold());
            } else {
                dto.setTicketMedio(0);
            }
        }
        
        // Calcular variação de lucro
        if (currentMetrics != null && lastMetrics != null) {
            Integer currentProfit = ((Number) currentMetrics[3]).intValue();
            Integer lastProfit = ((Number) lastMetrics[3]).intValue();
            
            if (lastProfit > 0) {
                double variation = ((currentProfit - lastProfit) / (double) lastProfit) * 100;
                dto.setProfitVariation(Math.round(variation * 10.0) / 10.0);
            }
        }
        
        // Buscar produto mais vendido
        String topProduct = financialRepository.getTopSellingProductCurrentMonth(year, month);
        dto.setTopSellingProduct(topProduct != null ? topProduct : "");
        
        return dto;
    }

    /**
     * Retorna evolução dos últimos N meses
     */
    public MonthlyEvolutionResponseDTO getMonthlyEvolution(int months) {
        List<Object[]> results = financialRepository.getMonthlyStats(months);
        
        List<MonthlyStatsDTO> monthlyStats = results.stream()
            .map(row -> {
                MonthlyStatsDTO dto = new MonthlyStatsDTO();
                dto.setMonthKey((String) row[0]);
                dto.setMonth(formatMonthDisplay((String) row[0]));
                dto.setItemsSold(((Number) row[1]).intValue());
                dto.setTotalSales(((Number) row[2]).intValue());
                dto.setTotalCost(((Number) row[3]).intValue());
                dto.setProfit(((Number) row[4]).intValue());
                dto.setMargin(((Number) row[5]).doubleValue());
                return dto;
            })
            .toList();
        
        // Calcular lucro máximo
        Integer maxProfit = monthlyStats.stream()
            .map(MonthlyStatsDTO::getProfit)
            .max(Integer::compareTo)
            .orElse(1);
        
        MonthlyEvolutionResponseDTO response = new MonthlyEvolutionResponseDTO();
        response.setMonths(monthlyStats);
        response.setMaxMonthProfit(maxProfit);
        
        return response;
    }

    /**
     * Retorna top N produtos mais vendidos
     */
    public TopProductsResponseDTO getTopProducts(int limit) {
        List<Object[]> results = financialRepository.getTopProducts(limit);
        
        List<TopProductDTO> topProducts = results.stream()
            .map(row -> {
                TopProductDTO dto = new TopProductDTO();
                dto.setName((String) row[0]);
                dto.setTimesSold(((Number) row[1]).intValue());
                dto.setTotalRevenue(((Number) row[2]).intValue());
                dto.setMargin(((Number) row[3]).doubleValue());
                return dto;
            })
            .toList();
        
        TopProductsResponseDTO response = new TopProductsResponseDTO();
        response.setTopProducts(topProducts);
        
        return response;
    }

    /**
     * Formata chave do mês para exibição
     * "2026-02" -> "fevereiro de 2026"
     */
    private String formatMonthDisplay(String monthKey) {
        String[] parts = monthKey.split("-");
        int year = Integer.parseInt(parts[0]);
        int month = Integer.parseInt(parts[1]);
        
        LocalDate date = LocalDate.of(year, month, 1);
        String monthName = date.getMonth().getDisplayName(TextStyle.FULL, PT_BR);
        
        return monthName + " de " + year;
    }
}
```

---

## 📦 Repository Layer

### FinancialRepository.java (Interface)
```java
package com.seuapp.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.seuapp.backend.model.Product;

import java.util.List;

@Repository
public interface FinancialRepository extends JpaRepository<Product, Long> {

    /**
     * Métricas do mês especificado
     * Retorna: [itemsSold, totalSales, totalCost, profit, margin]
     */
    @Query(value = """
        SELECT 
            COUNT(*) as items_sold,
            COALESCE(SUM(price), 0) as total_sales,
            COALESCE(SUM(cost_price), 0) as total_cost,
            COALESCE(SUM(price - cost_price), 0) as profit,
            CASE 
                WHEN SUM(price) > 0 THEN ROUND(SUM(price - cost_price) / SUM(price) * 100, 1)
                ELSE 0 
            END as margin
        FROM products
        WHERE disponivel = 0
          AND YEAR(sold_date) = :year
          AND MONTH(sold_date) = :month
        """, nativeQuery = true)
    Object[] getCurrentMonthMetrics(@Param("year") int year, @Param("month") int month);

    /**
     * Produto mais vendido do mês
     */
    @Query(value = """
        SELECT name
        FROM products
        WHERE disponivel = 0
          AND YEAR(sold_date) = :year
          AND MONTH(sold_date) = :month
        GROUP BY name
        ORDER BY COUNT(*) DESC
        LIMIT 1
        """, nativeQuery = true)
    String getTopSellingProductCurrentMonth(@Param("year") int year, @Param("month") int month);

    /**
     * Evolução mensal dos últimos N meses
     * Retorna: [monthKey, itemsSold, totalSales, totalCost, profit, margin]
     */
    @Query(value = """
        SELECT 
            DATE_FORMAT(sold_date, '%Y-%m') as month_key,
            COUNT(*) as items_sold,
            SUM(price) as total_sales,
            SUM(cost_price) as total_cost,
            SUM(price - cost_price) as profit,
            ROUND(SUM(price - cost_price) / SUM(price) * 100, 1) as margin
        FROM products
        WHERE disponivel = 0
          AND sold_date >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
        GROUP BY DATE_FORMAT(sold_date, '%Y-%m')
        ORDER BY month_key DESC
        """, nativeQuery = true)
    List<Object[]> getMonthlyStats(@Param("months") int months);

    /**
     * Top N produtos mais vendidos (histórico completo)
     * Retorna: [name, timesSold, totalRevenue, margin]
     */
    @Query(value = """
        SELECT 
            name,
            COUNT(*) as times_sold,
            SUM(price) as total_revenue,
            ROUND(AVG((price - cost_price) / price * 100), 1) as margin
        FROM products
        WHERE disponivel = 0
        GROUP BY name
        ORDER BY total_revenue DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> getTopProducts(@Param("limit") int limit);

    /**
     * Métricas de estoque
     * Retorna: [stockCount, stockValue, stockPotentialValue, stockPotentialProfit]
     */
    @Query(value = """
        SELECT 
            COUNT(*) as stock_count,
            SUM(cost_price) as stock_value,
            SUM(price) as stock_potential_value,
            SUM(price - cost_price) as stock_potential_profit
        FROM products
        WHERE disponivel = 1
        """, nativeQuery = true)
    Object[] getStockMetrics();

    /**
     * Produtos parados (estoque baixo)
     */
    @Query(value = """
        SELECT COUNT(*) as old_stock_count
        FROM products
        WHERE disponivel = 1 
          AND stock < 2
        """, nativeQuery = true)
    Integer getOldStockCount();

    /**
     * Produtos com menor margem (em estoque)
     * Retorna lista de produtos completos
     */
    @Query(value = """
        SELECT *
        FROM products
        WHERE disponivel = 1
          AND cost_price > 0
        ORDER BY (price - cost_price) / price ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> getLowMarginProducts(@Param("limit") int limit);
}
```

---

## 🎮 Controller

### FinancialController.java
```java
package com.seuapp.backend.controller;

import com.seuapp.backend.dto.*;
import com.seuapp.backend.service.FinancialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/financeiro")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FinancialController {

    private final FinancialService financialService;

    /**
     * GET /api/financeiro/resumo-mes-atual
     */
    @GetMapping("/resumo-mes-atual")
    public ResponseEntity<DashboardMetricsDTO> getCurrentMonthMetrics() {
        return ResponseEntity.ok(financialService.getCurrentMonthMetrics());
    }

    /**
     * GET /api/financeiro/evolucao-mensal?meses=6
     */
    @GetMapping("/evolucao-mensal")
    public ResponseEntity<MonthlyEvolutionResponseDTO> getMonthlyEvolution(
        @RequestParam(defaultValue = "6") int meses
    ) {
        return ResponseEntity.ok(financialService.getMonthlyEvolution(meses));
    }

    /**
     * GET /api/financeiro/produtos-top?limit=3
     */
    @GetMapping("/produtos-top")
    public ResponseEntity<TopProductsResponseDTO> getTopProducts(
        @RequestParam(defaultValue = "3") int limit
    ) {
        return ResponseEntity.ok(financialService.getTopProducts(limit));
    }
}
```

---

## ⚡ Otimizações de Performance

### 1. Índices no Banco de Dados
```sql
-- Índice composto para queries de vendas por data
CREATE INDEX idx_sold_date_disponivel 
ON products (sold_date, disponivel);

-- Índice para filtros de estoque
CREATE INDEX idx_disponivel_stock 
ON products (disponivel, stock);

-- Índice para agregações por nome
CREATE INDEX idx_name_disponivel 
ON products (name, disponivel);
```

### 2. Materialized View (Opcional - para alta escala)
```sql
-- View materializada com métricas pré-calculadas
CREATE TABLE financial_metrics_cache (
    metric_key VARCHAR(50) PRIMARY KEY,
    metric_value JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Trigger para atualizar cache ao vender/reativar produto
DELIMITER $$
CREATE TRIGGER update_financial_cache 
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF OLD.disponivel <> NEW.disponivel THEN
        -- Invalidar cache
        DELETE FROM financial_metrics_cache 
        WHERE metric_key = 'dashboard_current_month';
    END IF;
END$$
DELIMITER ;
```

### 3. Cache em Memória (Spring)
```java
@Service
@RequiredArgsConstructor
public class FinancialService {
    
    @Cacheable(value = "currentMonthMetrics", key = "#root.methodName")
    public DashboardMetricsDTO getCurrentMonthMetrics() {
        // ... implementação
    }
    
    @CacheEvict(value = "currentMonthMetrics", allEntries = true)
    public void invalidateCache() {
        // Chamado quando produto é vendido/reativado
    }
}
```

---

## 🔄 Migração do Frontend

### Antes (Frontend-Heavy)
```typescript
// Busca TODOS os produtos e calcula
loadData(): void {
  this.productService.buscarProdutos().subscribe({
    next: (produtos) => {
      this.soldProducts = produtos.filter(p => p.disponivel === 0);
      this.calculateAllMetrics(); // 6 métodos de cálculo
    }
  });
}
```

### Depois (Backend-Heavy)
```typescript
// Busca dados já calculados
loadData(): void {
  forkJoin({
    currentMonth: this.financialService.getCurrentMonthMetrics(),
    evolution: this.financialService.getMonthlyEvolution(6),
    topProducts: this.financialService.getTopProducts(3)
  }).subscribe({
    next: (data) => {
      this.currentMonthData = data.currentMonth;
      this.monthlyStats = data.evolution.months;
      this.topProducts = data.topProducts.topProducts;
    }
  });
}
```

---

## 📝 Checklist de Implementação

### Backend
- [ ] Criar pacote `dto` com todos os DTOs
- [ ] Criar `FinancialRepository` com queries nativas
- [ ] Criar `FinancialService` com lógica de negócio
- [ ] Criar `FinancialController` com endpoints REST
- [ ] Adicionar índices no banco de dados
- [ ] Testar endpoints com Postman/Insomnia
- [ ] Validar performance com dados reais
- [ ] ⚠️ **CRÍTICO**: Garantir que `sold_date = NULL` ao reativar produto

### Frontend
- [ ] Criar `FinancialService` em Angular
- [ ] Substituir cálculos locais por chamadas HTTP
- [ ] Remover métodos de cálculo do component
- [ ] Atualizar interfaces/models se necessário
- [ ] Testar integração completa
- [ ] Validar UI com dados do backend

---

## 🚨 Pontos Críticos de Atenção

### 1. Campo `soldDate`
```java
// ⚠️ OBRIGATÓRIO: Limpar soldDate ao reativar
@Transactional
public void reativarProduto(Long id) {
    Product produto = productRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Produto não encontrado"));
    
    produto.setDisponivel((byte) 1);
    produto.setSoldDate(null);  // ⚠️ CRÍTICO: Limpar data de venda
    produto.setStock(produto.getStock() > 0 ? produto.getStock() : 1);
    
    productRepository.save(produto);
}
```

**Por quê?** Se `soldDate` não for limpo, produto reativado aparecerá incorretamente em relatórios históricos de vendas.

### 2. Valores em Centavos
Todos os valores monetários são armazenados em **centavos** (Integer):
- R$ 150,00 = 15000
- R$ 1,50 = 150
- Frontend faz conversão: `(valor / 100).toFixed(2)`

### 3. Campo `disponivel`
- `1` = Disponível para venda (em estoque)
- `0` = Vendido (não disponível)

---

## 📊 Comparação de Performance

| Métrica | Atual (Frontend) | Ideal (Backend) | Melhoria |
|---------|------------------|-----------------|----------|
| Dados transferidos | ~500KB | ~2KB | **250x menor** |
| Tempo de processamento | 2-3 segundos | 50-100ms | **30x mais rápido** |
| Escalabilidade | 500-1000 produtos | 10.000+ produtos | **10x maior** |
| Carga no cliente | Alta | Mínima | N/A |
| SEO-friendly | ❌ Não | ✅ Sim | N/A |

---

## 🎯 Roadmap de Implementação

### Fase 1 - MVP (1-2 dias)
1. Criar DTOs básicos
2. Implementar endpoint `/resumo-mes-atual`
3. Testar integração frontend

### Fase 2 - Histórico (1 dia)
1. Implementar endpoint `/evolucao-mensal`
2. Implementar endpoint `/produtos-top`
3. Adicionar índices no banco

### Fase 3 - Otimização (1 dia)
1. Implementar cache em memória
2. Adicionar métricas de estoque
3. Performance tuning

---

## 📞 Suporte e Dúvidas

Se houver dúvidas sobre:
- **Estrutura de dados**: Conferir seção DTOs
- **Queries SQL**: Ver seção "Queries SQL"
- **Performance**: Ver seção "Otimizações"
- **Migração frontend**: Ver seção "Migração do Frontend"

---

**Versão**: 1.0  
**Data**: Março 2026  
**Status**: Pronto para implementação
