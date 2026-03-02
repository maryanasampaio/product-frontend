import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header com voltar -->
      <div class="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <button 
            (click)="voltar()"
            class="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Voltar para produtos
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-400"></div>
      </div>

      <!-- Produto não encontrado -->
      <div *ngIf="!isLoading && !produto" class="container mx-auto px-4 py-20 text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h2>
        <button 
          (click)="voltar()"
          class="text-orange-500 hover:text-orange-600 font-medium">
          Voltar para página inicial
        </button>
      </div>

      <!-- Detalhes do Produto -->
      <div *ngIf="!isLoading && produto" class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div class="grid md:grid-cols-2 gap-8 p-8">
            <!-- Galeria de Imagens -->
            <div class="space-y-4">
              <!-- Imagem Principal -->
              <div class="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                <img 
                  *ngIf="produto.images && produto.images.length > 0" 
                  [src]="produto.images[imagemPrincipalIndex]" 
                  [alt]="produto.name"
                  class="w-full h-full object-cover">
                <div *ngIf="!produto.images || produto.images.length === 0"
                  class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <svg class="h-40 w-40 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <!-- Miniaturas (todas as fotos até 4) -->
              <div *ngIf="produto.images && produto.images.length > 0" class="grid grid-cols-4 gap-3">
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
            <div class="space-y-6">
              <!-- Badges -->
              <div class="flex flex-wrap gap-2">
                <span [class]="produto.condition === 'novo' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'"
                  class="px-4 py-2 rounded-full text-sm font-bold">
                  {{ produto.condition === 'novo' ? '✨ Novo' : '♻️ Seminovo' }}
                </span>
                <span class="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-bold">
                  {{ produto.category }}
                </span>
              </div>

              <!-- Nome -->
              <h1 class="text-4xl font-bold text-gray-900">{{ produto.name }}</h1>

              <!-- Preço -->
              <div class="bg-gradient-to-r from-gray-50 to-orange-50 p-6 rounded-xl border-2 border-gray-200">
                <div class="text-sm text-gray-600 mb-2">Preço</div>
                <div class="text-5xl font-extrabold text-orange-500">
                  R$ {{ formatarPreco(produto.price) }}
                </div>
              </div>

              <!-- Descrição -->
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-3">Descrição</h2>
                <p class="text-gray-700 leading-relaxed text-lg">{{ produto.description }}</p>
              </div>

              <!-- Especificações -->
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-3">Especificações</h2>
                <div class="grid grid-cols-2 gap-4">
                  <div *ngIf="produto.material" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="text-sm text-gray-600 mb-1">Material</div>
                    <div class="font-semibold text-gray-900">{{ produto.material }}</div>
                  </div>
                  <div *ngIf="produto.color" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="text-sm text-gray-600 mb-1">Cor</div>
                    <div class="font-semibold text-gray-900">{{ produto.color }}</div>
                  </div>
                  <div *ngIf="produto.brand" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="text-sm text-gray-600 mb-1">Marca</div>
                    <div class="font-semibold text-gray-900">{{ produto.brand }}</div>
                  </div>
                  <div *ngIf="produto.warranty" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="text-sm text-gray-600 mb-1">Garantia</div>
                    <div class="font-semibold text-gray-900">{{ produto.warranty }}</div>
                  </div>
                </div>
              </div>

              <!-- Botão WhatsApp -->
              <div *ngIf="!produto.soldDate">
                <a 
                  [href]="getWhatsAppLink()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center justify-center gap-3 w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl">
                  <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Entre em Contato e Reserve Agora
                </a>
              </div>

              <!-- Produto Vendido -->
              <div *ngIf="produto.soldDate" class="text-center p-8 bg-gray-100 rounded-xl border-2 border-gray-300">
                <span class="text-3xl font-bold text-gray-700">✓ PRODUTO VENDIDO</span>
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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID da rota:', id);
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
