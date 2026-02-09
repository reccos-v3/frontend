import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SetupModuleCard, ISetupModule } from './components/setup-module-card/setup-module-card';
import { SetupSidebar } from './setup-sidebar/setup-sidebar';
import { SetupProgress } from './setup-progress/setup-progress';
import { ChampionshipStore } from '../../../services/championship.store';

@Component({
  selector: 'app-championship-setup',
  standalone: true,
  imports: [CommonModule, SetupModuleCard, SetupSidebar, SetupProgress],
  templateUrl: './championship-setup.html',
  styleUrl: './championship-setup.css',
})
export class ChampionshipSetup implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private championshipStore = inject(ChampionshipStore);

  championshipId = signal<string | null>(null);
  canEdit = this.championshipStore.canEdit;
  isLoading = this.championshipStore.loading;
  championship = this.championshipStore.championship;

  statusLabel = computed(() => {
    const data = this.championship();
    if (!data) return '';
    const labels: Record<string, string> = {
      DRAFT: 'Rascunho',
      ACTIVE: 'Ativo',
      FINISHED: 'Finalizado',
    };
    return labels[data.status] || data.status;
  });

  genderLabel = computed(() => {
    const data = this.championship();
    if (!data) return '';
    const labels: Record<string, string> = {
      MALE: 'Masculino',
      FEMALE: 'Feminino',
      MIXED: 'Misto',
    };
    return labels[data.gender] || data.gender;
  });

  seasonName = computed(() => {
    const data = this.championship();
    return data?.season?.name || 'Temporada Avulsa';
  });

  metadataCards = computed(() => {
    const data = this.championship();
    if (!data) return [];

    return [
      {
        id: 'MOD-01',
        label: 'Modalidade',
        value: data.modality.name,
        icon: 'sports_soccer',
        technicalId: 'MOD-01',
        theme: {
          bg: 'bg-indigo-50/30',
          darkBg: 'dark:bg-indigo-900/10',
          border: 'border-indigo-100',
          darkBorder: 'dark:border-indigo-900/30',
          hoverBorder: 'hover:border-indigo-300',
          iconBg: 'bg-indigo-600',
          iconShadow: 'shadow-indigo-100',
          labelColor: 'text-indigo-900',
          darkLabelColor: 'dark:text-indigo-400',
          technicalColor: 'text-indigo-300',
          darkTechnicalColor: 'dark:text-indigo-800',
        },
      },
      {
        id: 'CAT-V1',
        label: 'Categoria',
        value: this.genderLabel(),
        icon: data.gender === 'MALE' ? 'male' : data.gender === 'FEMALE' ? 'female' : 'wc',
        technicalId: 'CAT-V1',
        theme: {
          bg: 'bg-rose-50/30',
          darkBg: 'dark:bg-rose-900/10',
          border: 'border-rose-100',
          darkBorder: 'dark:border-rose-900/30',
          hoverBorder: 'hover:border-rose-300',
          iconBg: 'bg-rose-600',
          iconShadow: 'shadow-rose-100',
          labelColor: 'text-rose-900',
          darkLabelColor: 'dark:text-rose-400',
          technicalColor: 'text-rose-300',
          darkTechnicalColor: 'dark:text-rose-800',
        },
      },
      {
        id: 'SEA-24',
        label: 'Temporada',
        value: this.seasonName(),
        icon: 'calendar_today',
        technicalId: 'SEA-24',
        theme: {
          bg: 'bg-amber-50/30',
          darkBg: 'dark:bg-amber-900/10',
          border: 'border-amber-100',
          darkBorder: 'dark:border-amber-900/30',
          hoverBorder: 'hover:border-amber-300',
          iconBg: 'bg-amber-500',
          iconShadow: 'shadow-amber-100',
          labelColor: 'text-amber-900',
          darkLabelColor: 'dark:text-amber-400',
          technicalColor: 'text-amber-300',
          darkTechnicalColor: 'dark:text-amber-800',
        },
      },
    ];
  });

  setupModules = computed<ISetupModule[]>(() => {
    const data = this.championship();
    if (!data || !data.progress) return [];

    const p = data.progress;
    const editable = this.canEdit();

    return [
      {
        id: 'info',
        title: 'Informações Básicas',
        description: 'Nome, logo e descrição do campeonato.',
        icon: 'info',
        status: 'COMPLETED',
        statusLabel: 'Concluído',
        isLocked: !editable,
        payload: data,
      },
      {
        id: 'rules',
        title: 'Regras e Pontuação',
        description: 'Pontuação e critérios de desempate.',
        icon: 'gavel',
        status: p.rulesDone ? 'COMPLETED' : 'WARNING',
        statusLabel: p.rulesDone ? 'Concluído' : 'Atenção',
        isLocked: !editable,
        payload: data,
      },
      {
        id: 'periods',
        title: 'Períodos',
        description: 'Inscrições e duração do campeonato.',
        icon: 'calendar_month',
        status: p.periodDone ? 'COMPLETED' : 'PENDING',
        statusLabel: p.periodDone ? 'Concluído' : 'Incompleto',
        isLocked: !editable,
        payload: data,
      },
      {
        id: 'format',
        title: 'Formato e Estrutura',
        description: 'Grupos, eliminatórias e total de times.',
        icon: 'account_tree',
        status: p.structureDone ? 'COMPLETED' : 'PENDING',
        statusLabel: p.structureDone ? 'Concluído' : 'Incompleto',
        isLocked: !editable,
        payload: data,
      },
      {
        id: 'teams',
        title: 'Times',
        description: 'Gerenciar inscrições e times participantes.',
        icon: 'groups_2',
        status: p.teamsDone ? 'COMPLETED' : 'PENDING',
        statusLabel: p.teamsDone ? 'Concluído' : 'Pendente',
        isLocked: !editable,
        payload: data,
      },
      {
        id: 'seeding',
        title: 'Política de Seed',
        description: 'Critérios para definição de cabeças de chave.',
        icon: 'psychology',
        status: p.seedingDone ? 'COMPLETED' : 'PENDING',
        statusLabel: p.seedingDone ? 'Concluído' : 'Incompleto',
        isLocked: !editable,
        payload: data,
      },
      {
        id: 'review',
        title: 'Revisão Final',
        description: 'Validação completa para ativação.',
        icon: 'verified',
        // O review tem uma lógica extra: precisa estar editável E apto para ativar
        status: data.canActivate ? 'COMPLETED' : 'LOCKED',
        statusLabel: data.canActivate ? 'Pronto' : 'Bloqueado',
        isLocked: !editable || !data.canActivate,
        actionLabel: data.canActivate ? 'Revisar' : 'Aguardando etapas',
        payload: data,
      },
    ];
  });

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.championshipId.set(id);

    if (id) {
      this.championshipStore.ensureLoaded(id);
    }
  }

  onModuleAction(moduleId: string): void {
    const module = this.setupModules().find((m) => m.id === moduleId);

    this.router.navigate(['/admin/championships/setup', this.championshipId(), 'settings'], {
      state: { id: moduleId, isEdit: true, payload: module?.payload },
    });
  }
}
