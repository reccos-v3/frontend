import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface QuickAction {
  label: string;
  icon: string;
  description: string;
}

interface RecentChampionship {
  id: number;
  name: string;
  category: string;
  date: string;
  statusLabel: string;
  statusBg: string;
  statusColor: string;
  statusBorder: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  actionIcon: string;
}

@Component({
  selector: 'app-federation-dashboard',
  imports: [CommonModule],
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
    },
    {
      label: 'Convidar Usuários',
      icon: 'person_add',
      description: 'Adicione novos administradores',
    },
    {
      label: 'Gerenciar Pessoas',
      icon: 'manage_accounts',
      description: 'Edite perfis de atletas e staff',
    },
    {
      label: 'Campeonatos Ativos',
      icon: 'visibility',
      description: 'Acompanhe torneios em andamento',
    },
  ]);

  protected recentChampionships = signal<RecentChampionship[]>([
    {
      id: 1,
      name: 'Copa Verão 2024',
      category: 'Tênis • Masculino',
      date: 'Dez 20, 2024',
      statusLabel: 'Rascunho',
      statusBg: 'var(--color-gray-100)',
      statusColor: 'var(--color-gray-600)',
      statusBorder: 'var(--color-gray-200)',
      icon: 'edit_note',
      iconBg: 'var(--color-gray-100)',
      iconColor: 'var(--color-gray-400)',
      actionIcon: 'edit',
    },
    {
      id: 2,
      name: 'Open Paulista Juvenil',
      category: 'Tênis • Misto',
      date: 'Out 15 - Out 20',
      statusLabel: 'Ativo',
      statusBg: 'rgba(240, 253, 244, 1)',
      statusColor: 'rgba(21, 128, 61, 1)',
      statusBorder: 'rgba(187, 247, 208, 1)',
      icon: 'play_arrow',
      iconBg: 'rgba(220, 252, 231, 1)',
      iconColor: 'rgba(22, 163, 74, 1)',
      actionIcon: 'visibility',
    },
    {
      id: 3,
      name: 'Torneio de Inverno',
      category: 'Tênis • Feminino',
      date: 'Jul 10, 2024',
      statusLabel: 'Finalizado',
      statusBg: 'rgba(239, 246, 255, 1)',
      statusColor: 'rgba(29, 78, 216, 1)',
      statusBorder: 'rgba(191, 219, 254, 1)',
      icon: 'emoji_events',
      iconBg: 'rgba(219, 234, 254, 1)',
      iconColor: 'rgba(59, 130, 246, 1)',
      actionIcon: 'bar_chart',
    }
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

