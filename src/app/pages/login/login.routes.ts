import { Routes } from '@angular/router';

export const loginRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth-login/auth-login').then((m) => m.AuthLogin),
  },
  {
    path: 'enable-access',
    loadComponent: () => import('./enable-access/enable-access').then((m) => m.EnableAccess),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password').then((m) => m.ResetPassword),
  },
];
