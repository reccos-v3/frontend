import { Routes } from '@angular/router';

export const championshipsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./championship-list/championship-list').then((m) => m.ChampionshipList),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./championship-create/championship-create').then((m) => m.ChampionshipCreate),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./championship-create/championship-create').then((m) => m.ChampionshipCreate),
  },
  {
    path: 'setup/:id',
    loadComponent: () =>
      import('./championship-setup/championship-setup').then((m) => m.ChampionshipSetup),
  },
  {
    path: 'setup/:id/settings',
    loadComponent: () =>
      import('./championship-setup/setup-settings/setup-settings').then((m) => m.SetupSettings),
  },
];
