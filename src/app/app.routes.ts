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
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
