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
];
