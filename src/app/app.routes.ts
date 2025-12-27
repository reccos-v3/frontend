import { Routes } from '@angular/router';

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
    path: 'refresh-token',
    loadComponent: () =>
      import('./pages/login/refresh-token/refresh-token').then((m) => m.RefreshToken),
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
