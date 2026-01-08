import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionCardComponent } from '../../../components/action-card/action-card.component';
import { RecentChampionshipsComponent } from '../../../components/recent-championships/recent-championships.component';
import { OperationalShortcuts } from '../operational-shortcuts/operational-shortcuts';

interface QuickAction {
  label: string;
  icon: string;
  description: string;
  color?: string;
}

@Component({
  selector: 'app-federation-dashboard',
  imports: [CommonModule, ActionCardComponent, RecentChampionshipsComponent, OperationalShortcuts],
  templateUrl: './federation-dashboard.html',
  styleUrl: './federation-dashboard.css',
})
export class FederationDashboard {
  protected federationName = signal('Federação Paulista de Tênis');
  protected federationLogo = signal(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgzo9hPrjutjPsxrUPM1NVbpE_O3k2DOELP4d3RVUlzMRf1ukO-p1mdFdYclsBi9_Rj4hkbIEgUljz0uqn78IQ3svsqBdiheqK4R7AZmF7w7nJ8ecHf_wNisu84vmj40nz4H8esHqJaNOm2IDMthXreQV7D7r3qDbEMvlUdBuGnW5Mouo4gbpbK35yy_bfyItm94Wjrpp1XC4afVUVmVaw5-vKw13owagVfhajmURfJjLsrthwKFvIgKgFP0dfwJCE-RgB6uMJB0'
  );
  protected championshipCount = signal(12);
  protected userCount = signal(45);
  protected isActive = signal(true);
  protected quickActions = signal<QuickAction[]>([
    {
      label: 'Criar Campeonato',
      icon: 'add_circle',
      description: 'Configure um novo torneio do zero',
      color: 'primary',
    },
    {
      label: 'Convidar Usuários',
      icon: 'person_add',
      description: 'Adicione novos administradores',
      color: 'secondary',
    },
    {
      label: 'Gerenciar Pessoas',
      icon: 'manage_accounts',
      description: 'Edite perfis de atletas e staff',
      color: 'danger',
    },
    {
      label: 'Campeonatos Ativos',
      icon: 'visibility',
      description: 'Acompanhe torneios em andamento',
      color: 'warning',
    },
  ]);

  protected onActionHover(event: Event, isEnter: boolean): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;

    if (isEnter) {
      target.style.borderColor = 'var(--color-primary)';
    } else {
      target.style.borderColor = 'var(--color-border-light)';
    }
  }

  protected onIconHover(event: Event, isEnter: boolean): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;

    if (isEnter) {
      target.style.color = 'var(--color-primary-hover)';
    } else {
      target.style.color = 'var(--color-gray-400)';
    }
  }

  protected onLinkHover(event: Event, isEnter: boolean): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;

    if (isEnter) {
      target.style.color = 'var(--color-primary-hover)';
    } else {
      target.style.color = 'var(--color-gray-500)';
    }
  }
}
