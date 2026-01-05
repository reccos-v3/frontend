import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';
import { ILoginRequest, IAuth } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);

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
   * Realiza o logout do usuário
   */
  logout(): void {
    this.tokenService.clearTokens();
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

