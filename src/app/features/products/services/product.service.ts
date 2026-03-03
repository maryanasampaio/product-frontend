import { Observable } from "rxjs";
import { ProductResponse, Product, ProductFormData } from "../models/product.model";
import { Injectable } from '@angular/core';
import { ProductsRepository } from '../repository/product.repository';

/**
 * Serviço principal de produtos
 * Usa ProductsRepository para comunicação com backend real
 */
@Injectable({ providedIn: 'root' })
export class ProductService {

  constructor(private readonly repository: ProductsRepository) {}

  buscarProdutos(): Observable<ProductResponse[]> {
    return this.repository.buscarProdutos();
  }

  buscarProdutoPorId(id: number): Observable<ProductResponse> {
    return this.repository.buscarProdutoPorId(id);
  }

  criarProduto(data: ProductFormData): Observable<Product> {
    return this.repository.criarProduto(data);
  }

  atualizarProduto(id: number, data: Partial<ProductFormData>): Observable<Product> {
    return this.repository.atualizarProduto(id, data);
  }

  removerProduto(id: number): Observable<void> {
    return this.repository.removerProduto(id);
  }

  marcarComoVendido(id: number): Observable<Product> {
    return this.repository.marcarComoVendido(id);
  }

  reativarProduto(id: number, stock?: number): Observable<Product> {
    return this.repository.reativarProduto(id, stock);
  }
}