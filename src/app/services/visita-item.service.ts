import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VisitaItem } from '../models/visita-item'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisitaItemService {

  private apiUrl = `${environment.apiBaseUrl}/visitas`;

  constructor(private http: HttpClient) {}

  obterTodos(): Observable<VisitaItem[]> {
    return this.http.get<VisitaItem[]>(`${this.apiUrl}/itens`);
  }

  porVisita(visitaId: string): Observable<VisitaItem[]> {
    return this.http.get<VisitaItem[]>(`${this.apiUrl}/${visitaId}/itens`);
  }

  carregar(id: string): Observable<VisitaItem> {
    return this.http.get<VisitaItem>(`${this.apiUrl}/itens/${id}`);
  }

  salvar(item: VisitaItem): Observable<VisitaItem> {
    return this.http.post<VisitaItem>(`${this.apiUrl}/${item.visitaId}/itens`, item);
  }

  editar(item: VisitaItem): Observable<VisitaItem> {
    return this.http.put<VisitaItem>(`${this.apiUrl}/itens/${item.id}`, item);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/itens/${id}`);
  }
}
