import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

   private apiUrl = 'http://localhost:3000/users'; // coleção no db.json

  constructor(private http: HttpClient) { }

  login(login: string, senha: string): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}?login=${login}&senha=${senha}`).pipe(
      map(users => {
        if (users.length === 1) {
          localStorage.setItem('usuario', JSON.stringify(users[0]));
          localStorage.setItem('token', btoa(`${users[0].login}:${users[0].senha}`));
          return users[0];
        } else {
          throw new Error('Login ou senha inválidos');
        }
      })
    );
  }

  getUsuarioLogado(): User | null {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

  isLogado(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }
}
