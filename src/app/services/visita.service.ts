import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, concatMap, map, switchMap, toArray, forkJoin, of } from 'rxjs';
import { Visita } from '../models/visita';
import { EstoqueClienteService } from './estoque-cliente.service';
import { VisitaItemService } from './visita-item.service';
import { VisitaItem } from '../models/visita-item';

@Injectable({
  providedIn: 'root'
})
export class VisitasService {

  private apiUrl = 'http://localhost:3000/visita';

  constructor(
    private http: HttpClient,
    private visitaItemService: VisitaItemService,
    private estoqueClienteService: EstoqueClienteService
  ) {}

  obterTodos(): Observable<Visita[]> {
    return this.http.get<Visita[]>(this.apiUrl);
  }

  carregar(id: string): Observable<Visita> {
    return this.http.get<Visita>(`${this.apiUrl}/${id}`);
  }

  filtrar(clienteId?: string, data?: string): Observable<Visita[]> {
    let params = new HttpParams();
    if (clienteId) params = params.set('cliente_id', clienteId);
    if (data) params = params.set('data_visita', data);
    return this.http.get<Visita[]>(this.apiUrl, { params });
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

  salvarCompleto(
    visita: Omit<Visita, 'id'>,
    itensEntrada: Omit<VisitaItem, 'id' | 'visita_id' | 'possui_agora'>[]
  ): Observable<{ visitaId: string }> {

    return this.salvar(visita).pipe(
      switchMap(novaVisita => {
        const visitaId = novaVisita.id!;

        return from(itensEntrada).pipe(
          concatMap(it => {
            const possui_agora = it.possuia + it.entregue - it.vendido - it.retirado;
            if (possui_agora < 0) throw new Error(`possui_agora negativo para produto ${it.produto_id}`);

            const itemPayload: VisitaItem = {
              ...it,
              visita_id: visitaId,
              possui_agora
            };

            return this.visitaItemService.salvar(itemPayload).pipe(
             
              switchMap(() =>
                this._definirEstoqueCliente(visita.cliente_id, it.produto_id, possui_agora)
              )
            );
          }),
          toArray(),
          map(() => ({ visitaId }))
        );
      })
    );
  }

 

  private _definirEstoqueCliente(clienteId: string, produtoId: string, quantidade: number) {
    return this.estoqueClienteService.porClienteProduto(clienteId, produtoId).pipe(
      switchMap(regs => {
        const reg = regs[0];
        if (reg) {
          return this.estoqueClienteService.editar({ ...reg, quantidade });
        } else {
          return this.estoqueClienteService.salvar({ cliente_id: clienteId, produto_id: produtoId, quantidade });
        }
      })
    );
  }

  getCompleta(id: string) {
    return forkJoin({
      visita: this.carregar(id),
      itens: this.visitaItemService.porVisita(id)
    });
  }

}
