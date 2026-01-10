import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ProductsRepository } from '../../repository/product.repository';
import { ProductResponse } from '../../models/product.model';
// import { AuthService } from '../../../auth/services/auth.service';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  errorMessage = '';
  isLoading = false;
  produtos: ProductResponse[] = [
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProdutos();
  }

  private loadProdutos() {
    this.isLoading = true;
    this.productService.buscarProdutos()
      .pipe(finalize(() => { this.isLoading = false; }))
      .subscribe({
      next: (resp: ProductResponse[]) => {
        this.produtos = resp.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          description: p.description,
          images: typeof p.images === 'string' ? safeParseImages(p.images) : p.images,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        } as ProductResponse));
        console.log(this.produtos);
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Erro ao carregar produtos';
      },
    });
  }

  trackByProductId(index: number, produto: ProductResponse): number {
    return produto.id;
  }
}

function safeParseImages(value: string | null): string[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
