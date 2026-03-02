import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../products/services/product.service';
import { ProductResponse } from '../../../products/models/product.model';

interface MonthlyStats {
  month: string;
  monthKey: string;
  totalSales: number;
  totalCost: number;
  profit: number;
  itemsSold: number;
  margin: number;
}

interface ProductStats {
  name: string;
  timesSold: number;
  totalRevenue: number;
  margin: number;
}

interface ProductWithMargin extends ProductResponse {
  margin: number;
}

@Component({
  selector: 'app-financial-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">📊 Visão Geral do Negócio</h1>
          <p class="text-gray-600">Tudo o que você precisa saber em 10 segundos</p>
        </div>

        <!-- LINHA 1: Resumo Rápido -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <!-- 💰 Lucro do Mês -->
          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium opacity-90">💰 Lucro do Mês</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-3xl font-bold mb-1">R$ {{ formatarPreco(currentMonthProfit) }}</div>
            <div class="text-sm opacity-90 mb-2">Margem: {{ currentMonthMargin }}%</div>
            <div *ngIf="profitVariation !== 0" 
              [class]="profitVariation > 0 ? 'bg-white/20' : 'bg-red-900/30'"
              class="text-xs font-semibold px-2 py-1 rounded inline-flex items-center gap-1">
              <span *ngIf="profitVariation > 0">↑</span>
              <span *ngIf="profitVariation < 0">↓</span>
              {{ Math.abs(profitVariation) }}% vs mês passado
            </div>
          </div>

          <!-- 📦 Vendas do Mês -->
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium opacity-90">📦 Vendas do Mês</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div class="text-3xl font-bold mb-1">{{ currentMonthItemsSold }}</div>
            <div class="text-sm opacity-90 mb-2">Ticket médio: R$ {{ formatarPreco(ticketMedio) }}</div>
            <div *ngIf="topSellingProduct" class="text-xs bg-white/20 px-2 py-1 rounded truncate">
              🔥 Mais vendido: {{ topSellingProduct }}
            </div>
          </div>

          <!-- 📊 Margem Média -->
          <div class="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium opacity-90">📊 Margem Geral</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="text-3xl font-bold mb-1">{{ margemMedia }}%</div>
            <div class="text-sm opacity-90 mb-2">Lucro total: R$ {{ formatarPreco(totalProfit) }}</div>
            <div class="text-xs bg-white/20 px-2 py-1 rounded">
              Total vendido: R$ {{ formatarPreco(totalSalesAmount) }}
            </div>
          </div>

          <!-- 🧊 Estoque Atual -->
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium opacity-90">🧊 Estoque</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div class="text-3xl font-bold mb-1">{{ stockCount }}</div>
            <div class="text-sm opacity-90 mb-2">Valor investido: R$ {{ formatarPreco(stockValue) }}</div>
            <div *ngIf="oldStockCount > 0" class="text-xs bg-red-900/40 px-2 py-1 rounded">
              ⚠️ {{ oldStockCount }} parados há +60 dias
            </div>
          </div>
        </div>

        <!-- LINHA 2: Estratégia -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          <!-- 📈 Evolução Mensal -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📈</span> Evolução de Lucro
            </h2>
            <div class="space-y-3">
              <div *ngFor="let stat of monthlyStats.slice(0, 6)" class="flex items-center gap-4">
                <div class="w-24 text-sm font-medium text-gray-600">{{ stat.month }}</div>
                <div class="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div 
                    [style.width.%]="(stat.profit / maxMonthProfit * 100)"
                    [class]="stat.profit > 0 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-300'"
                    class="h-full flex items-center justify-end px-3 text-white text-xs font-bold transition-all duration-500">
                    <span *ngIf="stat.profit > 0">R$ {{ formatarPreco(stat.profit) }}</span>
                  </div>
                </div>
                <div class="w-16 text-right text-sm font-semibold" 
                  [class]="stat.margin >= 15 ? 'text-green-600' : 'text-orange-600'">
                  {{ stat.margin }}%
                </div>
              </div>
            </div>
          </div>

          <!-- 🔥 Top 3 Mais Vendidos -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🔥</span> Top 3 Produtos
            </h2>
            <div class="space-y-4">
              <div *ngFor="let item of topProducts; let i = index" 
                class="flex items-center gap-4 p-4 rounded-xl"
                [class]="i === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200' : 'bg-gray-50'">
                <div class="text-3xl font-bold" 
                  [class]="i === 0 ? 'text-orange-500' : 'text-gray-400'">
                  #{{ i + 1 }}
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900">{{ item.name }}</h3>
                  <p class="text-sm text-gray-600">{{ item.timesSold }} vendas • Margem {{ item.margin }}%</p>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-green-600">R$ {{ formatarPreco(item.totalRevenue) }}</div>
                  <div class="text-xs text-gray-500">receita</div>
                </div>
              </div>
              <div *ngIf="topProducts.length === 0" class="text-center py-8 text-gray-400">
                Nenhuma venda registrada ainda
              </div>
            </div>
          </div>
        </div>

        <!-- LINHA 3: Alertas e Ações -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          <!-- 💸 Valor em Estoque -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>💸</span> Capital em Estoque
            </h2>
            <div class="space-y-4">
              <div class="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div class="text-sm text-blue-600 font-medium mb-1">Valor Investido</div>
                <div class="text-2xl font-bold text-blue-700">R$ {{ formatarPreco(stockValue) }}</div>
                <div class="text-xs text-blue-600 mt-1">{{ stockCount }} produtos em estoque</div>
              </div>
              <div class="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <div class="text-sm text-green-600 font-medium mb-1">Potencial de Venda</div>
                <div class="text-2xl font-bold text-green-700">R$ {{ formatarPreco(stockPotentialValue) }}</div>
                <div class="text-xs text-green-600 mt-1">Lucro potencial: R$ {{ formatarPreco(stockPotentialProfit) }}</div>
              </div>
              <div *ngIf="oldStockCount > 0" class="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                <div class="text-sm text-orange-600 font-medium mb-1">⚠️ Atenção: Produtos Parados</div>
                <div class="text-2xl font-bold text-orange-700">{{ oldStockCount }}</div>
                <div class="text-xs text-orange-600 mt-1">Considere fazer promoção</div>
              </div>
            </div>
          </div>

          <!-- 📉 Produtos com Menor Margem -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📉</span> Produtos com Menor Margem
            </h2>
            <div class="space-y-3">
              <div *ngFor="let produto of lowMarginProducts.slice(0, 5)" 
                class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900 text-sm">{{ produto.name }}</h3>
                  <p class="text-xs text-gray-500">{{ produto.category }}</p>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold" 
                    [class]="produto.margin < 10 ? 'text-red-600' : 'text-orange-600'">
                    {{ produto.margin }}%
                  </div>
                  <div class="text-xs text-gray-500">margem</div>
                </div>
              </div>
              <div *ngIf="lowMarginProducts.length === 0" class="text-center py-8 text-gray-400">
                Todas as margens estão saudáveis!
              </div>
            </div>
          </div>
        </div>

        <!-- LINHA 4: Histórico Detalhado -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📋</span> Histórico Completo
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-gray-200">
                  <th class="text-left py-3 px-4 font-semibold text-gray-700">Mês</th>
                  <th class="text-right py-3 px-4 font-semibold text-gray-700">Vendas</th>
                  <th class="text-right py-3 px-4 font-semibold text-gray-700">Custo</th>
                  <th class="text-right py-3 px-4 font-semibold text-gray-700">Lucro</th>
                  <th class="text-right py-3 px-4 font-semibold text-gray-700">Margem</th>
                  <th class="text-right py-3 px-4 font-semibold text-gray-700">Qtd</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let stat of monthlyStats" class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-4 font-medium">{{ stat.month }}</td>
                  <td class="py-3 px-4 text-right">R$ {{ formatarPreco(stat.totalSales) }}</td>
                  <td class="py-3 px-4 text-right text-red-600">R$ {{ formatarPreco(stat.totalCost) }}</td>
                  <td class="py-3 px-4 text-right font-bold text-green-600">R$ {{ formatarPreco(stat.profit) }}</td>
                  <td class="py-3 px-4 text-right font-semibold" 
                    [class]="stat.margin >= 15 ? 'text-green-600' : 'text-orange-600'">
                    {{ stat.margin }}%
                  </td>
                  <td class="py-3 px-4 text-right">{{ stat.itemsSold }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FinancialDashboardComponent implements OnInit {
  // Produtos
  produtos: ProductResponse[] = [];
  soldProducts: ProductResponse[] = [];
  inStockProducts: ProductResponse[] = [];
  
  // Métricas gerais
  totalProfit = 0;
  totalSalesAmount = 0;
  totalItemsSold = 0;
  margemMedia = 0;
  
  // Métricas do mês atual
  currentMonthProfit = 0;
  currentMonthSales = 0;
  currentMonthCost = 0;
  currentMonthItemsSold = 0;
  currentMonthMargin = 0;
  profitVariation = 0;
  ticketMedio = 0;
  topSellingProduct = '';
  
  // Estoque
  stockCount = 0;
  stockValue = 0;
  stockPotentialValue = 0;
  stockPotentialProfit = 0;
  oldStockCount = 0;
  
  // Arrays para exibição
  monthlyStats: MonthlyStats[] = [];
  topProducts: ProductStats[] = [];
  lowMarginProducts: ProductWithMargin[] = [];
  maxMonthProfit = 0;
  
  // Expor Math para o template
  Math = Math;

  constructor(private readonly productService: ProductService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.productService.buscarProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.soldProducts = produtos.filter(p => p.soldDate);
        this.inStockProducts = produtos.filter(p => !p.soldDate);
        this.calculateAllMetrics();
      }
    });
  }

  calculateAllMetrics(): void {
    this.calculateMonthlyStats();
    this.calculateGeneralMetrics();
    this.calculateCurrentMonthMetrics();
    this.calculateStockMetrics();
    this.calculateTopProducts();
    this.calculateLowMarginProducts();
  }

  calculateMonthlyStats(): void {
    const monthsMap = new Map<string, MonthlyStats>();
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    this.soldProducts.forEach(produto => {
      if (produto.soldDate) {
        const soldDate = new Date(produto.soldDate);
        const monthKey = `${soldDate.getFullYear()}-${String(soldDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, {
            month: soldDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            monthKey: monthKey,
            totalSales: 0,
            totalCost: 0,
            profit: 0,
            itemsSold: 0,
            margin: 0
          });
        }

        const monthStat = monthsMap.get(monthKey)!;
        monthStat.totalSales += produto.price;
        monthStat.totalCost += produto.costPrice || 0;
        monthStat.profit += this.calcularLucro(produto);
        monthStat.itemsSold++;
      }
    });

    // Calcular margem para cada mês
    monthsMap.forEach(stat => {
      stat.margin = stat.totalSales > 0 
        ? Number(((stat.profit / stat.totalSales) * 100).toFixed(1))
        : 0;
    });

    this.monthlyStats = Array.from(monthsMap.values()).sort((a, b) => 
      b.monthKey.localeCompare(a.monthKey)
    );

    // Calcular lucro máximo para o gráfico
    this.maxMonthProfit = Math.max(...this.monthlyStats.map(s => s.profit), 1);

    // Calcular variação de lucro
    if (this.monthlyStats.length >= 2) {
      const currentMonth = this.monthlyStats.find(s => s.monthKey === currentMonthKey);
      const lastMonth = this.monthlyStats[1];
      
      if (currentMonth && lastMonth && lastMonth.profit > 0) {
        this.profitVariation = Number((((currentMonth.profit - lastMonth.profit) / lastMonth.profit) * 100).toFixed(1));
      }
    }
  }

  calculateGeneralMetrics(): void {
    this.totalProfit = 0;
    this.totalSalesAmount = 0;
    this.totalItemsSold = this.soldProducts.length;

    this.soldProducts.forEach(produto => {
      this.totalProfit += this.calcularLucro(produto);
      this.totalSalesAmount += produto.price;
    });

    // Margem média geral
    this.margemMedia = this.totalSalesAmount > 0 
      ? Number(((this.totalProfit / this.totalSalesAmount) * 100).toFixed(1))
      : 0;
  }

  calculateCurrentMonthMetrics(): void {
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const currentMonthStat = this.monthlyStats.find(s => s.monthKey === currentMonthKey);
    
    if (currentMonthStat) {
      this.currentMonthProfit = currentMonthStat.profit;
      this.currentMonthSales = currentMonthStat.totalSales;
      this.currentMonthCost = currentMonthStat.totalCost;
      this.currentMonthItemsSold = currentMonthStat.itemsSold;
      this.currentMonthMargin = currentMonthStat.margin;
    }

    // Ticket médio
    this.ticketMedio = this.currentMonthItemsSold > 0 
      ? Math.round(this.currentMonthSales / this.currentMonthItemsSold)
      : 0;

    // Produto mais vendido do mês
    const currentMonthProducts = this.soldProducts.filter(p => {
      if (!p.soldDate) return false;
      const soldDate = new Date(p.soldDate);
      const productMonthKey = `${soldDate.getFullYear()}-${String(soldDate.getMonth() + 1).padStart(2, '0')}`;
      return productMonthKey === currentMonthKey;
    });

    if (currentMonthProducts.length > 0) {
      const productCounts = new Map<string, number>();
      currentMonthProducts.forEach(p => {
        productCounts.set(p.name, (productCounts.get(p.name) || 0) + 1);
      });
      
      let maxCount = 0;
      let topName = '';
      productCounts.forEach((count, name) => {
        if (count > maxCount) {
          maxCount = count;
          topName = name;
        }
      });
      
      this.topSellingProduct = topName;
    }
  }

  calculateStockMetrics(): void {
    this.stockCount = this.inStockProducts.length;
    this.stockValue = 0;
    this.stockPotentialValue = 0;
    this.oldStockCount = 0;

    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    this.inStockProducts.forEach(produto => {
      this.stockValue += produto.costPrice || 0;
      this.stockPotentialValue += produto.price;

      // Verificar produtos parados (sem data de venda e mais de 60 dias)
      // Como não temos data de criação, vamos considerar produtos antigos
      // Na prática você deveria adicionar um campo `createdAt` no modelo
      if (produto.soldDate === null) {
        // Simplificação: considera "antigo" produtos com stock baixo ou featured false
        if (produto.stock && produto.stock < 2) {
          this.oldStockCount++;
        }
      }
    });

    this.stockPotentialProfit = this.stockPotentialValue - this.stockValue;
  }

  calculateTopProducts(): void {
    const productMap = new Map<string, ProductStats>();

    this.soldProducts.forEach(produto => {
      if (!productMap.has(produto.name)) {
        productMap.set(produto.name, {
          name: produto.name,
          timesSold: 0,
          totalRevenue: 0,
          margin: 0
        });
      }

      const stats = productMap.get(produto.name)!;
      stats.timesSold++;
      stats.totalRevenue += produto.price;
      
      // Calcular margem média
      const profit = this.calcularLucro(produto);
      stats.margin = produto.price > 0 
        ? Number((((profit) / produto.price) * 100).toFixed(1))
        : 0;
    });

    this.topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 3);
  }

  calculateLowMarginProducts(): void {
    // Pegar produtos em estoque com margem calculada
    const productsWithMargin = this.inStockProducts
      .filter(p => p.costPrice && p.costPrice > 0)
      .map(p => ({
        ...p,
        margin: Number((((p.price - (p.costPrice || 0)) / p.price) * 100).toFixed(1))
      }))
      .sort((a, b) => a.margin - b.margin);

    this.lowMarginProducts = productsWithMargin.slice(0, 5);
  }

  calcularLucro(produto: ProductResponse): number {
    if (!produto.costPrice) return 0;
    return produto.price - produto.costPrice;
  }

  formatarPreco(preco: number): string {
    return (preco / 100).toFixed(2).replace('.', ',');
  }
}
