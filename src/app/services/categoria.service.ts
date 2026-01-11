import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private apiUrl = `${environment.apiBaseUrl}/categorias`;

  constructor(private http: HttpClient) { }

   obterTodos() : Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }
  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
