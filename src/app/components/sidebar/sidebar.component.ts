import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  disabled?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private subscription = new Subscription();

  protected readonly userAvatar = signal(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAHjfwf-3_IyBw_Q9Fyczy56NVcUr-YX-qEdXYq9pmQEKSyvIf0HqM_K5UErPAGzw1PmkH4SRO9BzB_IiH8kt4QHD-TDDTusf5-14R7QlyT8xIas338znUk_JmtRHBbuhb9oHPSybgm_1Q-6OiGSWK6MWtBxah24Zgh83jzqHV9B83SgGW_DQLMehAd0ZlKt2-UjubLO55OK6UyWssBtXBPYBzGb5e74apDS8p_nT6Kg-qqZ67VpUAgZ2S2Rq2qfliJ3uVSO49b-Xw'
  );
  protected readonly userName = signal('Roberto Silva');
  protected readonly userRole = signal('Presidente');

  // Sinal da rota atual
  protected readonly currentUrl = signal<string>(this.router.url);

  protected readonly navItems = signal<NavItem[]>([
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin',
    },
    {
      label: 'Campeonatos',
      icon: 'trophy',
      route: '/admin/championships',
    },
    {
      label: 'Usuários & Convites',
      icon: 'group',
      route: 'users',
    },
    {
      label: 'Pessoas',
      icon: 'badge',
      route: 'people',
    },
    {
      label: 'Configurações',
      icon: 'settings',
      route: 'settings',
    },
    {
      label: 'Relatórios',
      icon: 'bar_chart',
      route: 'reports',
      disabled: true,
      badge: 'Em breve',
    },
  ]);

  ngOnInit(): void {
    // Atualiza o sinal da URL atual quando a navegação muda
    this.subscription.add(
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          map((event) => event.url.split('?')[0])
        )
        .subscribe((url) => {
          this.currentUrl.set(url);
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Função helper para verificar se uma rota está ativa
  protected isRouteActive(route: string): boolean {
    const currentUrl = this.currentUrl();
    // Para rotas exatas, compara diretamente
    if (currentUrl === route) {
      return true;
    }
    // Para rotas filhas (ex: /championships/create), verifica se começa com a rota pai
    if (currentUrl.startsWith(route + '/')) {
      return true;
    }
    return false;
  }
}
