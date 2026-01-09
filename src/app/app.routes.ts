import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginRoutes } from './pages/login/login.routes';
import { federationsRoutes } from './pages/federations/federations.routes';
import { championshipsRoutes } from './pages/championships/championships.routes';

export const routes: Routes = [
  // Rotas de autenticação
  ...loginRoutes,

  // Rotas administrativas protegidas
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'federation-dashboard',
        pathMatch: 'full',
      },
      // Rotas de federação
      ...federationsRoutes,
      // Rotas de campeonatos (com children)
      {
        path: 'championships',
        children: championshipsRoutes,
      },
    ],
  },

  // Redirecionamento padrão
  {
    path: '',
    redirectTo: '/admin',
    pathMatch: 'full',
  },
];
