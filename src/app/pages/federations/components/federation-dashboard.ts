import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Championship {
  id: number;
  name: string;
  status: 'active' | 'draft' | 'finished';
  modality: string;
  format: string;
  teams: number;
  icon: string;
}

interface KPI {
  label: string;
  value: number;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-federation-dashboard',
  imports: [CommonModule],
  templateUrl: './federation-dashboard.html',
  styleUrl: './federation-dashboard.css',
})
export class FederationDashboard {
  protected federationName = signal('Federação Paulista de Futebol Amador');
  protected federationLogo = signal('https://lh3.googleusercontent.com/aida-public/AB6AXuDXy0m5wCiizwgf-n_HUGvyq1xo2Lja6CB6z4PR7cNNEhQ1lwSLbZOH_BrBIVYAixMSCDOzwIoLnGv2BO5mTQd6oSZLKC79_qoDCt08MiiGoo3tYruBKkl6cO4VfvnTlJNHfB71MwOUDqAXf0g3OEfnsE3YMGPImyEEgbxszPMNT9PpILorKdFJJdqfruQz_rp8YrPHCNr5RMvGooglryvUaVGq3Z892pIE4nNOMZ489VpjWB3WVGkLptfNxUGO6OZb685CJY-wUKw');
  protected userAvatar = signal('https://lh3.googleusercontent.com/aida-public/AB6AXuAHjfwf-3_IyBw_Q9Fyczy56NVcUr-YX-qEdXYq9pmQEKSyvIf0HqM_K5UErPAGzw1PmkH4SRO9BzB_IiH8kt4QHD-TDDTusf5-14R7QlyT8xIas338znUk_JmtRHBbuhb9oHPSybgm_1Q-6OiGSWK6MWtBxah24Zgh83jzqHV9B83SgGW_DQLMehAd0ZlKt2-UjubLO55OK6UyWssBtXBPYBzGb5e74apDS8p_nT6Kg-qqZ67VpUAgZ2S2Rq2qfliJ3uVSO49b-Xw');
  protected season = signal('2024');
  protected isActive = signal(true);
  protected planType = signal('Premium');

  protected kpis = signal<KPI[]>([
    {
      label: 'Ativos',
      value: 3,
      description: 'Campeonatos ativos',
      icon: 'emoji_events',
      color: 'primary'
    },
    {
      label: 'Pendência',
      value: 12,
      description: 'Jogos pendentes',
      icon: 'pending_actions',
      color: 'warning'
    },
    {
      label: 'Agenda',
      value: 5,
      description: 'Jogos hoje/amanhã',
      icon: 'calendar_today',
      color: 'info'
    },
    {
      label: 'Staff',
      value: 8,
      description: 'Árbitros escalados',
      icon: 'sports',
      color: 'gray'
    }
  ]);

  protected championships = signal<Championship[]>([
    {
      id: 1,
      name: 'Copa Ouro 2024',
      status: 'active',
      modality: 'Futebol 7',
      format: 'Fase de Grupos',
      teams: 16,
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbqOF--vRtwVE2uvnhP1D9AfKaT1wal_2HLwGQyUBLRG1bnfzM2C5yUXJZW61msSu69FbiUtj2iBn1g_GtitgN7uDCQbzabayhjzoroyCnHyhj9tHDVoGc4WwLpta_8oow29Eg-DCmpt5EYNYVlMTHtF3i0IgulWF93DAmk94XdFj_kvgR_54al1zLJ6hVQou6Ih26RF_333_U0cwzZcCiSVlWoeTZAYtM-vA0pyuDZQISShfEbl0xC-Ax2_pkJhfZPW5rZOzPQIw'
    },
    {
      id: 2,
      name: 'Liga Master Verão',
      status: 'draft',
      modality: 'Futebol de Campo',
      format: 'Pontos Corridos',
      teams: 0,
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZALTRA-TjGF6eg9PlSukPsAtQZh_bdvwXDgxJJUhPcTaTd5vAM1WgvZCVMNrW7YTLKVLKFXRpAPev8J7LWGR5UtQcCyPm81cVkdUg88beubSIiOxIuqUs6DtWLNZk6Qai7jG3c5CtkpyC4CaWyZ6a-YiNVlgAF71BP3F_6uYuNt3XiWSRtg2QVq2uoFmhYzAHDNEb0xHe_UY3l96aWz7EIdGoHd3CGNd6teUdewzWiH1EnxOCFe9pbTP5_6rrJVKBmRjB4QHn6ks'
    },
    {
      id: 3,
      name: 'Supercopa Regional',
      status: 'finished',
      modality: 'Futsal',
      format: 'Mata-mata',
      teams: 0,
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqf66-VXICuBoR9KEGvFpc7ShH9auqNXIsICYpkcdwd0x7rheDuH98f7OrdiwlEI42CyyYFRmYeHPyHXyCQv0SWSU_0PECB--9sWCJUJUX7pneb_pixrqrrwH1DrjNC5XWc2ChWOBmjnpKVTTdqZZOFsnXP60LYEjJ29Jk4khQIBC85vGvaHSgmHXFb5Ybuu-guWiUFvE8kgj17j8PXWZvyY1RxREpqAIB0zUewjAR35IgU235yYsQcXkfuQo6iSxI6o0XvyCW54U'
    }
  ]);

  protected getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200';
      case 'draft':
        return 'px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200';
      case 'finished':
        return 'px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200';
      default:
        return '';
    }
  }

  protected getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Em andamento';
      case 'draft':
        return 'Rascunho';
      case 'finished':
        return 'Encerrado';
      default:
        return '';
    }
  }

  protected getChampionshipButtonText(status: string): string {
    switch (status) {
      case 'active':
        return 'Gerenciar';
      case 'draft':
        return 'Editar';
      case 'finished':
        return 'Resultados';
      default:
        return 'Ver';
    }
  }

  protected onCreateChampionship(): void {
    console.log('Criar novo campeonato');
  }

  protected onManageUsers(): void {
    console.log('Gerenciar usuários');
  }

  protected onSettings(): void {
    console.log('Configurações');
  }

  protected onManageChampionship(championship: Championship): void {
    console.log('Gerenciar campeonato:', championship);
  }

  protected onButtonHover(event: Event, isEnter: boolean): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    if (isEnter) {
      target.style.backgroundColor = 'var(--color-primary-hover)';
    } else {
      target.style.backgroundColor = 'var(--color-primary)';
    }
  }

  protected onSecondaryButtonHover(event: Event, isEnter: boolean): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    if (isEnter) {
      target.style.borderColor = 'var(--color-primary)';
      target.style.color = 'var(--color-primary)';
    } else {
      target.style.borderColor = 'var(--color-neutral-border)';
      target.style.removeProperty('color');
    }
  }

  protected onLinkHover(event: Event, isEnter: boolean): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    if (isEnter) {
      target.style.color = 'var(--color-primary-hover)';
    } else {
      target.style.color = 'var(--color-primary)';
    }
  }
}

