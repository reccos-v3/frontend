import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IAuth } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly AUTH_KEY = 'auth'; // Chave única para armazenar o objeto completo

  /**
   * Verifica se está no browser (não no servidor)
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Salva os dados de autenticação no localStorage
   * Salva no mesmo formato que o backend retorna (IAuth)
   */
  setAuthData(data: IAuth): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(data));
  }

  /**
   * Obtém todos os dados de autenticação do localStorage
   * Retorna no mesmo formato que o backend (IAuth)
   */
  getAuthData(): IAuth | null {
    if (!this.isBrowser()) {
      return null;
    }

    const authData = localStorage.getItem(this.AUTH_KEY);
    if (!authData) {
      return null;
    }

    try {
      return JSON.parse(authData) as IAuth;
    } catch (error) {
      console.error('Erro ao parsear dados de autenticação:', error);
      return null;
    }
  }

  /**
   * Obtém o access token do localStorage
   */
  getAccessToken(): string | null {
    const authData = this.getAuthData();
    return authData?.accessToken || null;
  }

  /**
   * Obtém o refresh token do localStorage
   */
  getRefreshToken(): string | null {
    const authData = this.getAuthData();
    return authData?.refreshToken || null;
  }

  /**
   * Obtém o federationId do localStorage
   */
  getFederationId(): string | null {
    const authData = this.getAuthData();
    return authData?.federationId || null;
  }

  /**
   * Obtém o role do localStorage
   */
  getRole(): string | null {
    const authData = this.getAuthData();
    return authData?.role || null;
  }

  /**
   * Remove todos os dados de autenticação do localStorage
   */
  clearTokens(): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.removeItem(this.AUTH_KEY);
  }

  /**
   * Verifica se existe um token válido no localStorage
   */
  hasToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Verifica se o token JWT está expirado
   * Nota: Esta é uma verificação básica. Para validação completa, use o backend
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return true;
    }

    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return true;
      }

      const expirationDate = payload.exp * 1000; // Converter para milissegundos
      return Date.now() >= expirationDate;
    } catch (error) {
      return true;
    }
  }

  /**
   * Decodifica o token JWT (sem validação de assinatura)
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }
}

