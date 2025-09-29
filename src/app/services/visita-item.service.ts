import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VisitaItem } from '../models/visita-item'

@Injectable({
  providedIn: 'root'
})
export class VisitaItemService {

private apiUrl = 'http://localhost:3000/visita_item';

  constructor(private http: HttpClient) {}

  obterTodos(): Observable<VisitaItem[]> {
    return this.http.get<VisitaItem[]>(this.apiUrl);
  }

  porVisita(visitaId: string): Observable<VisitaItem[]> {
    const params = new HttpParams().set('visita_id', visitaId);
    return this.http.get<VisitaItem[]>(this.apiUrl, { params });
  }

  carregar(id: string): Observable<VisitaItem> {
    return this.http.get<VisitaItem>(`${this.apiUrl}/${id}`);
  }

  salvar(item: VisitaItem): Observable<VisitaItem> {
    return this.http.post<VisitaItem>(this.apiUrl, item);
  }

  editar(item: VisitaItem): Observable<VisitaItem> {
    return this.http.put<VisitaItem>(`${this.apiUrl}/${item.id}`, item);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
