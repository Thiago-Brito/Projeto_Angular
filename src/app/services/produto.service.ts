import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private apiUrl = 'http://localhost:3000/produtos';

  constructor(private http: HttpClient) { }

  obterTodos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }
  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  filtrar(nome: string): Observable<Produto[]> {

    let parametros = new HttpParams();

    if (nome) {
      parametros = parametros.set('nome_like', nome);
    }

    return this.http.get<Produto[]>(this.apiUrl, {
      params: parametros
    });
  }

  salvar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto);
  }

  carregarProduto(id: string): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`);
  }

  editar(produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/${produto.id}`, produto);
  }

}