import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ISeasonRequest, ISeasonResponse } from '../interfaces/season.interface';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { IAuth } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class SeasonService {
  private http = inject(HttpClient);
  private router = inject(Router);

  /**
   * Busca temporadas por federationId
   * @param federationId - ID da federação
   * @returns Observable<ISeasonResponse[]> - Observable com as temporadas
   */
  getSeasonsByFederationId(): Observable<ISeasonResponse[]> {
    const federationId: IAuth = JSON.parse(localStorage.getItem('auth') || '{}').federationId;
    return this.http
      .get<ISeasonResponse[]>(`${environment.apiUrl}/federations/${federationId}/seasons`)
      .pipe(
        catchError((error) => {
          console.error('Erro ao buscar temporadas:', error);
          return throwError(() => error);
        })
      );
  }

  createSeason(seasonRequest: ISeasonRequest): Observable<ISeasonResponse> {
    const federationId: IAuth = JSON.parse(localStorage.getItem('auth') || '{}').federationId;
    return this.http
      .post<ISeasonResponse>(
        `${environment.apiUrl}/federations/${federationId}/seasons`,
        seasonRequest
      )
      .pipe(
        catchError((error) => {
          console.error('Erro ao criar temporada:', error);
          return throwError(() => error);
        })
      );
  }
}
