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
    path: '',
    loadComponent: () =>
      import('./components/layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'federation-dashboard',
        loadComponent: () =>
          import('./pages/federations/federation-dashboard/federation-dashboard').then(
            (m) => m.FederationDashboard
          ),
      },
      {
        path: 'championships',
        loadComponent: () =>
          import('./pages/championships/championship-list/championship-list').then(
            (m) => m.ChampionshipList
          ),
      },
      {
        path: 'championships/create',
        loadComponent: () =>
          import('./pages/championships/championship-create/championship-create').then(
            (m) => m.ChampionshipCreate
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/federations/federation-dashboard/federation-dashboard').then(
            (m) => m.FederationDashboard
          ),
      },
      {
        path: 'people',
        loadComponent: () =>
          import('./pages/federations/federation-dashboard/federation-dashboard').then(
            (m) => m.FederationDashboard
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/federations/federation-dashboard/federation-dashboard').then(
            (m) => m.FederationDashboard
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/federations/federation-dashboard/federation-dashboard').then(
            (m) => m.FederationDashboard
          ),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/federation-dashboard',
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
