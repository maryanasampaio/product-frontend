import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { Product, ProductResponse } from "../models/product.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ProductsRepository {

    private apiUrl = environment.apiUrl;

      constructor(private http: HttpClient) {}


      buscarProdutos() : Observable<ProductResponse[]>{
return this.http.get<ProductResponse[]>(`${environment.apiUrl}/produtos`);        
      }

      buscarProdutoPorId(Id: number) : Observable<ProductResponse>{
        return this.http.get<ProductResponse>(`${environment.apiUrl}/produtos/${Id}`);
      }
      

}