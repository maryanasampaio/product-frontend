import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { AdminModeService } from '../../../../core/services/admin-mode.service';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CapitalizePipe],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <!-- Header com voltar -->
      <div class="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div class="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <button 
            (click)="voltar()"
            class="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm sm:text-base">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="hidden sm:inline">Voltar para produtos</span>
            <span class="sm:hidden">Voltar</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>

      <!-- Produto não encontrado -->
      <div *ngIf="!isLoading && !produto" class="max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-20 text-center">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h2>
        <button 
          (click)="voltar()"
          class="text-orange-500 hover:text-orange-600 font-medium text-sm sm:text-base">
          Voltar para página inicial
        </button>
      </div>

      <!-- Detalhes do Produto -->
      <div *ngIf="!isLoading && produto" class="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          <div class="grid md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
            <!-- Galeria de Imagens -->
            <div class="space-y-2 sm:space-y-3">
              <!-- Imagem Principal -->
              <div class="aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                <img 
                  *ngIf="produto.images && produto.images.length > 0" 
                  [src]="produto.images[imagemPrincipalIndex]" 
                  [alt]="produto.name"
                  class="w-full h-full object-cover">
                <div *ngIf="!produto.images || produto.images.length === 0"
                  class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <svg class="h-20 w-20 sm:h-32 sm:w-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <!-- Miniaturas (todas as fotos até 4) -->
              <div *ngIf="produto.images && produto.images.length > 0" class="grid grid-cols-4 gap-1.5 sm:gap-2">
                <button 
                  *ngFor="let img of produto.images.slice(0, 4); let i = index" 
                  (click)="selecionarImagem(i)"
                  [class.ring-4]="i === imagemPrincipalIndex"
                  [class.ring-orange-400]="i === imagemPrincipalIndex"
                  class="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-orange-300 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                  <img [src]="img" [alt]="produto.name" class="w-full h-full object-cover">
                </button>
              </div>
            </div>

            <!-- Informações -->
            <div class="space-y-3 sm:space-y-4 md:space-y-5">
              <!-- Badges -->
              <div class="flex flex-wrap gap-1.5 sm:gap-2">
                <span [class]="produto.condition === 'novo' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'"
                  class="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold">
                  {{ produto.condition === 'novo' ? '✨ Novo' : '♻️ Seminovo' }}
                </span>
                <span class="px-2 py-1 sm:px-3 sm:py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs sm:text-sm font-bold">
                  {{ produto.category | capitalize }}
                </span>
              </div>

              <!-- Nome -->
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{{ produto.name | capitalize }}</h1>

              <!-- Preço -->
              <div class="bg-gradient-to-r from-gray-50 to-orange-50 p-4 sm:p-5 rounded-lg sm:rounded-xl border-2 border-gray-200">
                <div class="text-xs sm:text-sm text-gray-600 mb-1">Preço</div>
                <div class="text-3xl sm:text-4xl font-extrabold text-orange-500">
                  R$ {{ formatarPreco(produto.price) }}
                </div>
              </div>

              <!-- Descrição -->
              <div>
                <h2 class="text-base sm:text-lg font-bold text-gray-900 mb-2">Descrição</h2>
                <p class="text-sm sm:text-base text-gray-700 leading-relaxed">{{ produto.description | capitalize }}</p>
              </div>

              <!-- Especificações -->
              <div *ngIf="produto.material || produto.color || produto.brand || produto.warranty">
                <h2 class="text-base sm:text-lg font-bold text-gray-900 mb-2">Especificações</h2>
                <div class="grid grid-cols-2 gap-2 sm:gap-3">
                  <div *ngIf="produto.material" class="bg-gray-50 p-2.5 sm:p-3 rounded-lg border border-gray-200">
                    <div class="text-xs text-gray-600 mb-0.5 sm:mb-1">Material</div>
                    <div class="font-semibold text-gray-900 text-xs sm:text-sm">{{ produto.material | capitalize }}</div>
                  </div>
                  <div *ngIf="produto.color" class="bg-gray-50 p-2.5 sm:p-3 rounded-lg border border-gray-200">
                    <div class="text-xs text-gray-600 mb-0.5 sm:mb-1">Cor</div>
                    <div class="font-semibold text-gray-900 text-xs sm:text-sm">{{ produto.color | capitalize }}</div>
                  </div>
                  <div *ngIf="produto.brand" class="bg-gray-50 p-2.5 sm:p-3 rounded-lg border border-gray-200">
                    <div class="text-xs text-gray-600 mb-0.5 sm:mb-1">Marca</div>
                    <div class="font-semibold text-gray-900 text-xs sm:text-sm">{{ produto.brand | capitalize }}</div>
                  </div>
                  <div *ngIf="produto.warranty" class="bg-gray-50 p-2.5 sm:p-3 rounded-lg border border-gray-200">
                    <div class="text-xs text-gray-600 mb-0.5 sm:mb-1">Garantia</div>
                    <div class="font-semibold text-gray-900 text-xs sm:text-sm">{{ produto.warranty | capitalize }}</div>
                  </div>
                </div>
              </div>

              <!-- Botões Admin -->
              <div *ngIf="isAdmin" class="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl border-2 border-orange-200">
                <button 
                  *ngIf="produto.disponivel === 1"
                  (click)="marcarComoVendido()"
                  class="flex-1 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg text-xs sm:text-sm">
                  ✓ Marcar como Vendido
                </button>
                <button 
                  *ngIf="produto.disponivel === 0"
                  (click)="reativarProduto()"
                  class="flex-1 py-2.5 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg text-xs sm:text-sm">
                  ↻ Reativar Produto
                </button>
              </div>

              <!-- Botão WhatsApp -->
              <div *ngIf="produto.disponivel === 1">
                <a 
                  [href]="getWhatsAppLink()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center justify-center gap-2 sm:gap-3 w-full py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-sm sm:text-base">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span class="hidden xs:inline">Entre em Contato e Reserve Agora</span>
                  <span class="xs:hidden">Entrar em Contato</span>
                </a>
              </div>

              <!-- Produto Vendido -->
              <div *ngIf="produto.disponivel === 0" class="text-center p-4 sm:p-6 bg-gray-100 rounded-lg sm:rounded-xl border-2 border-gray-300">
                <span class="text-lg sm:text-2xl font-bold text-gray-700">✓ PRODUTO VENDIDO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  produto?: Product;
  isLoading = true;
  imagemPrincipalIndex = 0;
  isAdmin = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly cdr: ChangeDetectorRef,
    public readonly adminModeService: AdminModeService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID da rota:', id);
    
    // Verifica modo admin
    this.adminModeService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    
    if (id) {
      this.loadProduto(Number(id));
    } else {
      this.isLoading = false;
    }
  }

  loadProduto(id: number): void {
    console.log('Buscando produto com ID:', id);
    this.isLoading = true;
    this.imagemPrincipalIndex = 0; // Reset para primeira imagem
    this.productService.buscarProdutoPorId(id).subscribe({
      next: (produto) => {
        console.log('Produto encontrado:', produto);
        // Usar setTimeout para garantir que a view foi completamente hidratada
        setTimeout(() => {
          this.produto = produto;
          this.isLoading = false;
          console.log('Estado atualizado - isLoading:', this.isLoading, 'produto:', !!this.produto);
          this.cdr.detectChanges();
          console.log('DetectChanges chamado');
        }, 0);
      },
      error: (error) => {
        console.error('Erro ao buscar produto:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('Observable completado');
      }
    });
  }

  marcarComoVendido(): void {
    if (!this.produto) return;
    
    if (confirm('Marcar este produto como vendido?')) {
      this.productService.marcarComoVendido(this.produto.id).subscribe({
        next: () => {
          alert('✅ Produto marcado como vendido!');
          this.loadProduto(this.produto!.id);
        },
        error: (err) => {
          console.error('Erro ao marcar como vendido:', err);
          alert('❌ Erro ao marcar como vendido. Verifique sua conexão e permissões.');
        }
      });
    }
  }

  reativarProduto(): void {
    if (!this.produto) return;
    
    if (confirm('Reativar este produto para venda?')) {
      this.productService.reativarProduto(this.produto.id).subscribe({
        next: () => {
          alert('✅ Produto reativado com sucesso!');
          this.loadProduto(this.produto!.id);
        },
        error: (err) => {
          console.error('Erro ao reativar produto:', err);
          alert('❌ Erro ao reativar produto. Verifique sua conexão e permissões.');
        }
      });
    }
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }

  selecionarImagem(index: number): void {
    this.imagemPrincipalIndex = index;
  }

  getWhatsAppLink(): string {
    if (!this.produto) return '';
    
    const numero = '5582996572843';
    const mensagem = `Olá! Tenho interesse no produto:\n\n*${this.produto.name}*\nPreço: R$ ${this.formatarPreco(this.produto.price)}\n\nPode me passar mais informações?`;
    
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  }

  formatarPreco(preco: number): string {
    return (preco / 100).toFixed(2).replace('.', ',');
  }
}
