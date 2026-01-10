import { Observable } from "rxjs";
import { ProductsRepository } from "../repository/product.repository";
import { ProductResponse } from "../models/product.model";
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductService{

  constructor(private productsRepository: ProductsRepository) {}

    buscarProdutos() :  Observable<ProductResponse[]>{
        return this.productsRepository.buscarProdutos();
    }

    buscarProdutoPorId(Id: number) : Observable<ProductResponse>{
        return this.productsRepository.buscarProdutoPorId(Id);
    }
    
}