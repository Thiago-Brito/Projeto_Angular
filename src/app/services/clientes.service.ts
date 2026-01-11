import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cliente } from '../models/cliente';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private apiUrl = `${environment.apiBaseUrl}/clientes`;

  constructor(private http: HttpClient) { }

  obterTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }
  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  filtrar(nome: string): Observable<Cliente[]> {

    let parametros = new HttpParams();

    if (nome) {
      parametros = parametros.set('nome', nome);
    }

    return this.http.get<Cliente[]>(this.apiUrl, {
      params: parametros
    });
  }

  salvar(Cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, Cliente);
  }

  carregarCliente(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  editar(Cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${Cliente.id}`, Cliente);
  }
}
