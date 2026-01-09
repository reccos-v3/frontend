import { Routes } from '@angular/router';

export const federationsRoutes: Routes = [
  {
    path: 'federation-dashboard',
    loadComponent: () =>
      import('./federation-dashboard/federation-dashboard').then((m) => m.FederationDashboard),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./federation-dashboard/federation-dashboard').then((m) => m.FederationDashboard),
  },
  {
    path: 'people',
    loadComponent: () =>
      import('./federation-dashboard/federation-dashboard').then((m) => m.FederationDashboard),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./federation-dashboard/federation-dashboard').then((m) => m.FederationDashboard),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./federation-dashboard/federation-dashboard').then((m) => m.FederationDashboard),
  },
];
