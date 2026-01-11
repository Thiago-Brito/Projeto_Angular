import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  login(login: string, senha: string): Observable<User> {
    return this.http
      .post<User | { usuario: User; token?: string }>(this.apiUrl, { login, senha })
      .pipe(
        map((resp) => {
          const user = (resp as { usuario?: User })?.usuario ?? (resp as User);
          if (!user) {
            throw new Error('Login ou senha invalidos');
          }

          const token = (resp as { token?: string })?.token ?? btoa(`${user.login}:${user.senha}`);
          localStorage.setItem('usuario', JSON.stringify(user));
          localStorage.setItem('token', token);
          return user;
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
