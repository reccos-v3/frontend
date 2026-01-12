import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  IValidateInvitationCodeRequest,
  IValidateInvitationResponse,
  IActivateInvitationRequest,
  IActivateInvitationResponse,
} from '../components/interfaces/invitation.interface';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  private http = inject(HttpClient);

  /**
   * Valida o código de convite
   * @param token Token do convite (da URL)
   * @param code Código de verificação inserido pelo usuário
   */
  validateCode(token: string, code: string): Observable<IValidateInvitationResponse> {
    const body: IValidateInvitationCodeRequest = { code };
    return this.http
      .post<IValidateInvitationResponse>(
        `${environment.apiUrl}/auth/invitations/${token}/validate`,
        body
      )
      .pipe(
        catchError((error) => {
          console.error('Erro ao validar código:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Ativa o convite e cria o acesso do usuário
   * @param request Dados para ativação
   */
  activate(request: IActivateInvitationRequest): Observable<IActivateInvitationResponse> {
    return this.http
      .post<IActivateInvitationResponse>(`${environment.apiUrl}/auth/activate`, request)
      .pipe(
        catchError((error) => {
          console.error('Erro ao ativar convite:', error);
          return throwError(() => error);
        })
      );
  }
}
