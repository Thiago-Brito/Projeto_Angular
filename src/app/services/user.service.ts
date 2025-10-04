import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

    salvar(user: User): Observable<User> {
      return this.http.post<User>(this.apiUrl, user);
    }
  
    carregarUser(id: string): Observable<User> {
      return this.http.get<User>(`${this.apiUrl}/${id}`);
    }
  
    editar(user: User): Observable<User> {
      return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
    }
}
