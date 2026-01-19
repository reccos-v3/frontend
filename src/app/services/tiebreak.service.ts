import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ITiebreakResponse } from '../interfaces/tiebreak.interface';

@Injectable({
  providedIn: 'root',
})
export class TiebreakService {
  private http = inject(HttpClient);

  getAllTiebreaks(): Observable<any> {
    return this.http.get<ITiebreakResponse>(`${environment.apiUrl}/tiebreak-criteria`).pipe(
      catchError((error) => {
        console.error('Erro ao buscar critérios de desempate:', error);
        return throwError(() => error);
      }),
    );
  }
}
