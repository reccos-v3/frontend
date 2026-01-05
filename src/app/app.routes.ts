import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/auth-login/auth-login').then((m) => m.AuthLogin),
  },
  {
    path: 'enable-access',
    loadComponent: () =>
      import('./pages/login/enable-access/enable-access').then((m) => m.EnableAccess),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/login/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/login/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'federation-dashboard',
    loadComponent: () =>
      import('./pages/federations/components/federation-dashboard').then(
        (m) => m.FederationDashboard
      ),
    canActivate: [authGuard], // Protege a rota exigindo autenticação
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  // Exemplo de rota protegida por role (descomente e ajuste conforme necessário):
  // {
  //   path: 'admin',
  //   loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
  //   canActivate: [roleGuard],
  //   data: { roles: ['ADMIN'] } // Define os roles permitidos
  // },
];
