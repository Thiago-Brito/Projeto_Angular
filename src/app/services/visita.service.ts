import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { Visita, VisitaPayload } from '../models/visita';
import { VisitaItemService } from './visita-item.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisitasService {

  private apiUrl = `${environment.apiBaseUrl}/visitas`;

  constructor(
    private http: HttpClient,
    private visitaItemService: VisitaItemService
  ) {}

  obterTodos(): Observable<Visita[]> {
    return this.http.get<Visita[]>(this.apiUrl);
  }

  carregar(id: string): Observable<Visita> {
    return this.http.get<Visita>(`${this.apiUrl}/${id}`);
  }

  filtrar(clienteId?: string, data?: string): Observable<Visita[]> {
    const url = clienteId ? `${this.apiUrl}/cliente/${clienteId}` : this.apiUrl;
    let params = new HttpParams();
    if (data) params = params.set('dataVisita', data);
    return this.http.get<Visita[]>(url, { params });
  }

  salvar(visita: Visita): Observable<Visita> {
    return this.http.post<Visita>(this.apiUrl, visita);
  }

  editar(visita: Visita): Observable<Visita> {
    return this.http.put<Visita>(`${this.apiUrl}/${visita.id}`, visita);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  salvarCompleto(payload: VisitaPayload): Observable<{ visitaId: string }> {
    return this.http.post<Visita>(this.apiUrl, payload).pipe(
      map((novaVisita) => ({ visitaId: String(novaVisita.id ?? '') }))
    );
  }

  getCompleta(id: string) {
    return this.carregar(id).pipe(
      switchMap((visita) => {
        if (visita.itens && visita.itens.length > 0) {
          return of({ visita, itens: visita.itens });
        }
        return this.visitaItemService.porVisita(id).pipe(
          map((itens) => ({ visita, itens }))
        );
      })
    );
  }

  getPagamento(id: string): Observable<{ valorTotal: number; valorPago: number; pago: boolean }> {
    return this.http.get<{ valorTotal: number; valorPago: number; pago: boolean }>(`${this.apiUrl}/${id}/pagamento`);
  }

  atualizarPagamento(id: string, valorPago: number): Observable<Visita> {
    return this.http.patch<Visita>(`${this.apiUrl}/${id}/pagamento`, { valorPago });
  }

  getNotaConferencia(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/nota-conferencia?formato=80mm`, {
      responseType: 'blob'
    });
  }

}
