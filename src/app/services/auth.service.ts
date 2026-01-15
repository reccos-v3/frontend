import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';
import { RolesService } from './roles.service';
import {
  ILoginRequest,
  IAuth,
  IValidateResetTokenResponse,
  IResetPasswordRequest,
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private rolesService = inject(RolesService);

  /**
   * Realiza o login do usuário
   */
  login(credentials: ILoginRequest): Observable<IAuth> {
    return this.http.post<IAuth>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        // Salva os dados de autenticação no localStorage no mesmo formato do backend
        this.tokenService.setAuthData(response);
      }),
      catchError((error) => {
        console.error('Erro no login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Envia solicitação de recuperação de senha
   */
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/password/forgot`, { email }).pipe(
      catchError((error) => {
        console.error('Erro na recuperação de senha:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Valida o token de recuperação de senha
   */
  validatePasswordResetToken(token: string): Observable<IValidateResetTokenResponse> {
    return this.http
      .get<IValidateResetTokenResponse>(
        `${environment.apiUrl}/auth/password/reset/${token}/validate`
      )
      .pipe(
        catchError((error) => {
          console.error('Erro na validação do token:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Redefine a senha do usuário
   */
  resetPassword(payload: IResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/password/reset`, payload).pipe(
      catchError((error) => {
        console.error('Erro na redefinição de senha:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    this.tokenService.clearTokens();
    // Limpa cache de roles ao fazer logout
    this.rolesService.clearCache();
    this.router.navigate(['/login']);
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const hasToken = this.tokenService.hasToken();
    const isExpired = this.tokenService.isTokenExpired();

    if (!hasToken || isExpired) {
      if (hasToken && isExpired) {
        // Token expirado, limpar dados
        this.tokenService.clearTokens();
      }
      return false;
    }

    return true;
  }

  /**
   * Obtém o role do usuário atual
   */
  getCurrentRole(): string | null {
    return this.tokenService.getRole();
  }

  /**
   * Verifica se o usuário tem um role específico
   */
  hasRole(role: string): boolean {
    const currentRole = this.getCurrentRole();
    return currentRole === role;
  }

  /**
   * Verifica se o usuário tem algum dos roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const currentRole = this.getCurrentRole();
    return currentRole ? roles.includes(currentRole) : false;
  }

  /**
   * Obtém o federationId do usuário atual
   */
  getCurrentFederationId(): string | null {
    return this.tokenService.getFederationId();
  }
}
