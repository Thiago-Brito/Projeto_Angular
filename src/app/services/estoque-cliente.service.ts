import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstoqueCliente } from '../models/estoque-cliente';

@Injectable({ providedIn: 'root' })
export class EstoqueClienteService {

  private apiUrl = 'http://localhost:3000/estoque_cliente';

  constructor(private http: HttpClient) { }

  obterTodos(): Observable<EstoqueCliente[]> {
    return this.http.get<EstoqueCliente[]>(this.apiUrl);
  }

  carregar(id: string): Observable<EstoqueCliente> {
    return this.http.get<EstoqueCliente>(`${this.apiUrl}/${id}`);
  }

  porClienteProduto(clienteId: string, produtoId: string): Observable<EstoqueCliente[]> {
    const params = new HttpParams()
      .set('cliente_id', clienteId)
      .set('produto_id', produtoId);
    return this.http.get<EstoqueCliente[]>(this.apiUrl, { params });
  }

  salvar(reg: EstoqueCliente): Observable<EstoqueCliente> {
    return this.http.post<EstoqueCliente>(this.apiUrl, reg);
  }

  editar(reg: EstoqueCliente): Observable<EstoqueCliente> {
    return this.http.put<EstoqueCliente>(`${this.apiUrl}/${reg.id}`, reg);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obterPorClienteComSaldo(clienteId: string) {
    return this.http.get<EstoqueCliente[]>(
      `${this.apiUrl}?cliente_id=${clienteId}&quantidade_gte=1`
    );
  }
}
