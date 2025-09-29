import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Localidade } from '../models/localidade';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalidadeService {

  private apiUrl = 'http://localhost:3000/localidades';

  constructor(private http: HttpClient) { }

   obterTodos() : Observable<Localidade[]> {
    return this.http.get<Localidade[]>(this.apiUrl);
  }
}
