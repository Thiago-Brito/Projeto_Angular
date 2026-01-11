import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EstoqueCliente } from '../models/estoque-cliente';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstoqueClienteService {

  private apiUrl = `${environment.apiBaseUrl}/estoques`;

  constructor(private http: HttpClient) { }

  obterTodos(): Observable<EstoqueCliente[]> {
    return this.http.get<EstoqueCliente[]>(this.apiUrl);
  }

  carregar(id: string): Observable<EstoqueCliente> {
    return this.http.get<EstoqueCliente>(`${this.apiUrl}/${id}`);
  }

  porClienteProduto(clienteId: string, produtoId: string): Observable<EstoqueCliente[]> {
    return this.http
      .get<EstoqueCliente[]>(`${this.apiUrl}/cliente/${clienteId}`)
      .pipe(
        map((lista) =>
          (lista || []).filter((ec) => String(ec.produto_id) === String(produtoId))
        )
      );
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
      `${this.apiUrl}/cliente/${clienteId}`
    );
  }
}
