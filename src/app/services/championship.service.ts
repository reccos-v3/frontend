import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { IAuth } from '../interfaces/auth.interface';
import { IChampionshipRequest, IChampionshipResponse } from '../interfaces/championship.interface';

@Injectable({
  providedIn: 'root',
})
export class ChampionshipService {
  private http = inject(HttpClient);
  private router = inject(Router);

  createChampionship(championshipRequest: IChampionshipRequest): Observable<IChampionshipResponse> {
    const federationId: IAuth = JSON.parse(localStorage.getItem('auth') || '{}').federationId;
    return this.http
      .post<IChampionshipResponse>(
        `${environment.apiUrl}/federations/${federationId}/championships`,
        championshipRequest
      )
      .pipe(
        catchError((error) => {
          console.error('Erro ao criar campeonato:', error);
          return throwError(() => error);
        })
      );
  }
}
