import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  IValidateInvitationCodeRequest,
  IValidateInvitationResponse,
  IActivateInvitationRequest,
  IActivateInvitationResponse,
  ISendInvitationRequest,
  ISendInvitationResponse,
  IInvitation,
} from '../interfaces/invitation.interface';
import { IPage } from '../interfaces/page.interface';
import { IAuth } from '../interfaces/auth.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

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
        body,
      )
      .pipe(
        catchError((error) => {
          console.error('Erro ao validar código:', error);
          return throwError(() => error);
        }),
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
        }),
      );
  }

  sendInvitation(request: ISendInvitationRequest): Observable<ISendInvitationResponse> {
    const federationId = this.tokenService.getFederationId();

    return this.http
      .post<ISendInvitationResponse>(
        `${environment.apiUrl}/federations/${federationId}/invitations`,
        request,
      )
      .pipe(
        catchError((error) => {
          console.error('Erro ao enviar convite:', error);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Busca lista paginada de convites
   */
  getInvitations(page: number = 0, size: number = 10): Observable<IPage<IInvitation>> {
    const federationId = this.tokenService.getFederationId();

    return this.http
      .get<
        IPage<IInvitation>
      >(`${environment.apiUrl}/federations/${federationId}/invitations?page=${page}&size=${size}`)
      .pipe(
        catchError((error) => {
          console.error('Erro ao buscar convites:', error);
          return throwError(() => error);
        }),
      );
  }
}
