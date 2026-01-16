import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { IAuth } from '../interfaces/auth.interface';
import { IChampionshipRequest, IChampionshipResponse } from '../interfaces/championship.interface';
import { IPage } from '../interfaces/page.interface';

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

  getChampionshipsByFederation(
    page: number = 0,
    size: number = 10
  ): Observable<IPage<IChampionshipResponse>> {
    const federationId: IAuth = JSON.parse(localStorage.getItem('auth') || '{}').federationId;
    return this.http
      .get<IPage<IChampionshipResponse>>(
        `${environment.apiUrl}/federations/${federationId}/championships`,
        {
          params: {
            page: page.toString(),
            size: size.toString(),
          },
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Erro ao buscar campeonatos:', error);
          return throwError(() => error);
        })
      );
  }

  getChampionshipById(id: string): Observable<IChampionshipResponse> {
    return this.http.get<IChampionshipResponse>(`${environment.apiUrl}/championships/${id}`).pipe(
      catchError((error) => {
        console.error('Erro ao buscar campeonato:', error);
        return throwError(() => error);
      })
    );
  }

  updateChampionship(
    id: string,
    championshipRequest: IChampionshipRequest
  ): Observable<IChampionshipResponse> {
    return this.http
      .put<IChampionshipResponse>(`${environment.apiUrl}/championships/${id}`, championshipRequest)
      .pipe(
        catchError((error) => {
          console.error('Erro ao atualizar campeonato:', error);
          return throwError(() => error);
        })
      );
  }

  deleteChampionship(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/championships/${id}`).pipe(
      catchError((error) => {
        console.error('Erro ao deletar campeonato:', error);
        return throwError(() => error);
      })
    );
  }
}
