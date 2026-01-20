import { Routes } from '@angular/router';
import { authGuard } from './components/guards/auth.guard';
import { rolesResolver } from './resolvers/roles.resolver';
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
    resolve: {
      roles: rolesResolver,
    },
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
      {
        path: 'invitations',
        loadComponent: () =>
          import('./pages/invitations/manage-invitations/manage-invitations').then(
            (m) => m.ManageInvitations,
          ),
      },
    ],
  },
  {
    path: 'admin/championships/setup/:id',
    loadComponent: () =>
      import('./pages/championships/championship-setup/championship-setup').then(
        (m) => m.ChampionshipSetup,
      ),
  },

  // Redirecionamento padrão
  {
    path: '',
    redirectTo: '/admin',
    pathMatch: 'full',
  },
];
