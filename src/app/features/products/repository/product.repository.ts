import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { Product, ProductResponse, ProductFormData } from "../models/product.model";
import { Observable } from "rxjs";

/**
 * Repository para comunicação com API de produtos
 * Base: http://localhost:8080
 * Rotas públicas (sem token): GET /produtos, GET /produtos/:id
 * Rotas privadas (com token): POST, PUT, DELETE, POST /sold
 */
@Injectable({ providedIn: 'root' })
export class ProductsRepository {

  private readonly apiUrl = environment.apiUrl; // http://localhost:8080

  constructor(private readonly http: HttpClient) {}

  /**
   * Buscar todos os produtos (PÚBLICO - sem token)
   * GET /produtos
   */
  buscarProdutos(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.apiUrl}/produtos`);
  }

  /**
   * Buscar produto por ID (PÚBLICO - sem token)
   * GET /produtos/:id
   */
  buscarProdutoPorId(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/produtos/${id}`);
  }

  /**
   * Criar novo produto (PRIVADO - requer token admin)
   * POST /produtos
   */
  criarProduto(data: ProductFormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/produtos`, data);
  }

  /**
   * Atualizar produto existente (PRIVADO - requer token admin)
   * PUT /produtos/:id
   */
  atualizarProduto(id: number, data: Partial<ProductFormData>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/produtos/${id}`, data);
  }

  /**
   * Deletar produto (PRIVADO - requer token admin)
   * DELETE /produtos/:id
   */
  removerProduto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/produtos/${id}`);
  }

  /**
   * Marcar produto como vendido (PRIVADO - requer token admin)
   * POST /produtos/:id/sold
   */
  marcarComoVendido(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/produtos/${id}/sold`, {});
  }
}