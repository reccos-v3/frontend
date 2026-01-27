import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP que adiciona o token de autenticação nas requisições
 * e trata erros de autenticação (401, 403)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Injeta serviços (necessário mesmo no servidor, mas só serão usados no browser)
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtém o token do localStorage (apenas no browser)
  const token = isBrowser ? tokenService.getAccessToken() : null;

  // Adiciona o token no header Authorization se existir
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Processa a requisição e trata erros
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Tratamento de erros apenas no browser
      if (isBrowser) {
        // Se receber 401 (Unauthorized), o token pode estar inválido ou expirado
        if (error.status === 401) {
          // Limpa os tokens e redireciona para login
          authService.logout();
        }

        // Se receber 403 (Forbidden), o usuário não tem permissão
        if (error.status === 403) {
          // Pode redirecionar para uma página de acesso negado ou apenas logar o erro
          console.error('Acesso negado:', error);
        }
      }

      return throwError(() => error);
    }),
  );
};
