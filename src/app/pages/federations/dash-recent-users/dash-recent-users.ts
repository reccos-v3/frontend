import { Component } from '@angular/core';

@Component({
  selector: 'app-dash-recent-users',
  imports: [],
  templateUrl: './dash-recent-users.html',
  styleUrl: './dash-recent-users.css',
})
export class DashRecentUsers {
  users = [
    {
      id: 1,
      name: 'João Doria',
      role: 'Administrador',
      status: 'Ativo',
    },
    {
      id: 2,
      name: 'Maria Silva',
      role: 'Administrador',
      status: 'Ativo',
    },
    {
      id: 3,
      name: 'Pedro Costa',
      role: 'Administrador',
      status: 'Ativo',
    },
  ];
}
