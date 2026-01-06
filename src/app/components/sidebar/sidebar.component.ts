import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly userAvatar = signal(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAHjfwf-3_IyBw_Q9Fyczy56NVcUr-YX-qEdXYq9pmQEKSyvIf0HqM_K5UErPAGzw1PmkH4SRO9BzB_IiH8kt4QHD-TDDTusf5-14R7QlyT8xIas338znUk_JmtRHBbuhb9oHPSybgm_1Q-6OiGSWK6MWtBxah24Zgh83jzqHV9B83SgGW_DQLMehAd0ZlKt2-UjubLO55OK6UyWssBtXBPYBzGb5e74apDS8p_nT6Kg-qqZ67VpUAgZ2S2Rq2qfliJ3uVSO49b-Xw'
  );
  protected readonly userName = signal('Roberto Silva');
  protected readonly userRole = signal('Presidente');

  protected readonly navItems = signal<NavItem[]>([
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/federation-dashboard',
      active: true,
    },
    {
      label: 'Campeonatos',
      icon: 'trophy',
      route: '/championships',
    },
    {
      label: 'Usuários & Convites',
      icon: 'group',
      route: '/users',
    },
    {
      label: 'Pessoas',
      icon: 'badge',
      route: '/people',
    },
    {
      label: 'Configurações',
      icon: 'settings',
      route: '/settings',
    },
    {
      label: 'Relatórios',
      icon: 'bar_chart',
      route: '/reports',
      disabled: true,
      badge: 'Em breve',
    },
  ]);
}