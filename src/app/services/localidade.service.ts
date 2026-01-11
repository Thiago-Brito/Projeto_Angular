import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Localidade } from '../models/localidade';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalidadeService {

  private apiUrl = `${environment.apiBaseUrl}/localidades`;

  constructor(private http: HttpClient) { }

   obterTodos() : Observable<Localidade[]> {
    return this.http.get<Localidade[]>(this.apiUrl);
  }
}
