import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Product, ProductResponse, ProductFormData } from '../models/product.model';

/**
 * Serviço de Mock para simular API de produtos (móveis)
 * Remove a dependência do backend enquanto desenvolve o frontend
 */
@Injectable({
  providedIn: 'root'
})
export class ProductMockService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Sofá 3 Lugares Retrátil Cinza',
      slug: 'sofa-3-lugares-retratil-cinza',
      description: 'Sofá confortável de 3 lugares com mecanismo retrátil e encosto reclinável. Perfeito para sala de estar.',
      price: 189900, // R$ 1.899,00
      costPrice: 130000, // R$ 1.300,00
      condition: 'novo',
      category: 'Sofá',
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800'
      ],
      stock: 5,
      dimensions: {
        width: 220,
        height: 85,
        depth: 95,
        unit: 'cm'
      },
      material: 'Tecido e Espuma',
      color: 'Cinza',
      brand: 'Util Lar',
      warranty: '90 dias',
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Mesa de Jantar 6 Lugares Madeira Maciça',
      slug: 'mesa-jantar-6-lugares-madeira',
      description: 'Mesa de jantar robusta em madeira maciça, comporta até 6 pessoas. Acabamento envernizado.',
      price: 129900, // R$ 1.299,00
      costPrice: 85000,
      condition: 'novo',
      category: 'Mesa',
      images: [
        'https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=800'
      ],
      stock: 3,
      dimensions: {
        width: 160,
        height: 75,
        depth: 90,
        unit: 'cm'
      },
      material: 'Madeira Maciça',
      color: 'Marrom',
      brand: 'Mobília Prime',
      warranty: '6 meses',
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Guarda-Roupa 4 Portas Branco Semi-Novo',
      slug: 'guarda-roupa-4-portas-branco',
      description: 'Guarda-roupa amplo com 4 portas e prateleiras internas. Estado de conservação: excelente.',
      price: 69900, // R$ 699,00
      costPrice: 40000,
      condition: 'seminovo',
      category: 'Guarda-Roupa',
      images: [
        'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800'
      ],
      stock: 1,
      dimensions: {
        width: 180,
        height: 220,
        depth: 55,
        unit: 'cm'
      },
      material: 'MDP',
      color: 'Branco',
      warranty: '30 dias',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Cadeira de Escritório Ergonômica',
      slug: 'cadeira-escritorio-ergonomica',
      description: 'Cadeira giratória com apoio lombar, ajuste de altura e braços. Ideal para home office.',
      price: 45900, // R$ 459,00
      costPrice: 28000,
      condition: 'novo',
      category: 'Cadeira',
      images: [
        'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800'
      ],
      stock: 12,
      dimensions: {
        width: 60,
        height: 110,
        depth: 60,
        unit: 'cm'
      },
      material: 'Metal e Tecido',
      color: 'Preto',
      brand: 'ErgoMax',
      warranty: '1 ano',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Rack para TV até 55" com LED',
      slug: 'rack-tv-55-led',
      description: 'Rack moderno com iluminação LED embutida, 2 gavetas e prateleira central.',
      price: 79900, // R$ 799,00
      costPrice: 52000,
      condition: 'novo',
      category: 'Rack',
      images: [
        'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800'
      ],
      stock: 7,
      dimensions: {
        width: 180,
        height: 45,
        depth: 40,
        unit: 'cm'
      },
      material: 'MDF',
      color: 'Preto/Branco',
      brand: 'Util Lar',
      warranty: '90 dias',
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  private nextId = 6;

  /**
   * Busca todos os produtos
   */
  buscarProdutos(): Observable<ProductResponse[]> {
    return of([...this.products]).pipe(delay(800)); // Simula latência de rede
  }

  /**
   * Busca produto por ID
   */
  buscarProdutoPorId(id: number): Observable<ProductResponse> {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      return throwError(() => new Error('Produto não encontrado'));
    }
    return of({ ...product }).pipe(delay(500));
  }

  /**
   * Cria novo produto
   */
  criarProduto(data: ProductFormData): Observable<Product> {
    const newProduct: Product = {
      id: this.nextId++,
      ...data,
      slug: this.generateSlug(data.name),
      soldDate: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.products.unshift(newProduct);
    return of(newProduct).pipe(delay(500));
  }

  /**
   * Atualiza produto existente
   */
  atualizarProduto(id: number, data: Partial<ProductFormData>): Observable<Product> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return throwError(() => new Error('Produto não encontrado'));
    }

    this.products[index] = {
      ...this.products[index],
      ...data,
      slug: data.name ? this.generateSlug(data.name) : this.products[index].slug,
      updatedAt: new Date().toISOString()
    };

    return of({ ...this.products[index] }).pipe(delay(500));
  }

  /**
   * Remove produto
   */
  removerProduto(id: number): Observable<void> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return throwError(() => new Error('Produto não encontrado'));
    }

    this.products.splice(index, 1);
    return of(undefined).pipe(delay(300));
  }

  /**
   * Marca produto como vendido
   */
  marcarComoVendido(id: number): Observable<Product> {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      return throwError(() => new Error('Produto não encontrado'));
    }

    product.soldDate = new Date().toISOString();
    product.stock = 0;
    product.updatedAt = new Date().toISOString();

    return of({ ...product }).pipe(delay(500));
  }

  /**
   * Gera slug a partir do nome
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
