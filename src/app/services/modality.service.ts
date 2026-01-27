import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { IModalityResponse } from '../interfaces/modality.interface';

@Injectable({
  providedIn: 'root',
})
export class ModalityService {
  private http = inject(HttpClient);

  /**
   * Realiza o login do usuário
   */
  getAllModalities(): Observable<IModalityResponse[]> {
    return this.http.get<IModalityResponse[]>(`${environment.apiUrl}/modalities`).pipe(
      catchError((error) => {
        console.error('Erro ao buscar modalidades:', error);
        return throwError(() => error);
      }),
    );
  }
}
