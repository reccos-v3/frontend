import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rotas baseado em roles
 * Verifica se o usuário tem o role necessário para acessar a rota
 *
 * Uso nas rotas:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [roleGuard],
 *   data: { roles: ['ADMIN', 'SUPER_ADMIN'] }
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Primeiro verifica se está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Obtém os roles necessários da configuração da rota
  const requiredRoles = route.data['roles'] as string[];

  // Se não houver roles especificados, permite acesso (apenas autenticação necessária)
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Verifica se o usuário tem algum dos roles necessários
  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // Se não tiver o role necessário, redireciona para dashboard ou página de acesso negado
  console.warn('Acesso negado: role insuficiente');
  router.navigate(['/admin']); // Ou criar uma página de acesso negado
  return false;
};
