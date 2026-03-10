import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { IPairingStrategiesResponse } from '../interfaces/pairing-strategies.interfaces';

@Injectable({
  providedIn: 'root',
})
export class PairingStrategiesService {
  private http = inject(HttpClient);

  getPairingStrategies(): Observable<IPairingStrategiesResponse[]> {
    return this.http
      .get<IPairingStrategiesResponse[]>(`${environment.apiUrl}/pairing-strategies`)
      .pipe(
        catchError((error) => {
          console.error('Erro ao buscar estratégias de pareamento:', error);
          return throwError(() => error);
        }),
      );
  }
}
