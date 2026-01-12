import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IRole } from '../components/interfaces/roles.interface';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private http = inject(HttpClient);

  getAllRoles(): Observable<IRole[]> {
    return this.http.get<IRole[]>(`${environment.apiUrl}/roles`);
  }
}
