import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { Product, ProductResponse, ProductFormData } from "../models/product.model";
import { Observable } from "rxjs";

/**
 * Repository para comunicação com API de produtos
 * Endpoints: http://localhost:3000/api/products
 */
@Injectable({ providedIn: 'root' })
export class ProductsRepository {

  private apiUrl = environment.apiUrl; // http://localhost:3000/api

  constructor(private http: HttpClient) {}

  /**
   * Buscar todos os produtos
   * GET /produtos
   */
  buscarProdutos(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.apiUrl}/produtos`);
  }

  /**
   * Buscar produto por ID
   * GET /produtos/:id
   */
  buscarProdutoPorId(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/produtos/${id}`);
  }

  /**
   * Criar novo produto
   * POST /produtos
   */
  criarProduto(data: ProductFormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/produtos`, data);
  }

  /**
   * Atualizar produto existente
   * PUT /produtos/:id
   */
  atualizarProduto(id: number, data: Partial<ProductFormData>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/produtos/${id}`, data);
  }

  /**
   * Deletar produto
   * DELETE /produtos/:id
   */
  removerProduto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/produtos/${id}`);
  }

  /**
   * Marcar produto como vendido
   * POST /produtos/:id/sold
   */
  marcarComoVendido(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/produtos/${id}/sold`, {});
  }
}