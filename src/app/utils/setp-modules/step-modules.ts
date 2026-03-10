import { SetupModuleStatus } from '../../pages/championships/championship-setup/components/setup-module-card/setup-module-card';
import { IChampionshipResponse } from '../../interfaces/championship.interface';

export interface IModuleLogicContext {
  data: IChampionshipResponse;
  editable: boolean;
}

export interface IDynamicModuleProps {
  status: SetupModuleStatus;
  statusLabel: string;
  isLocked?: boolean;
  actionLabel?: string;
}

export interface IStepModuleTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  shouldShow?: (ctx: IModuleLogicContext) => boolean;
  getDynamicProps: (ctx: IModuleLogicContext) => IDynamicModuleProps;
}

export const STEP_MODULES: IStepModuleTemplate[] = [
  {
    id: 'info',
    title: 'Informações Básicas',
    description: 'Nome, logo e descrição do campeonato.',
    icon: 'info',
    getDynamicProps: ({ data, editable }) => ({
      status: data.progress.basics ? 'COMPLETED' : 'PENDING',
      statusLabel: data.progress.basics ? 'Concluído' : 'Incompleto',
      isLocked: !editable,
    }),
  },
  {
    id: 'rules',
    title: 'Regras e Pontuação',
    description: 'Pontuação e critérios de desempate.',
    icon: 'sports_score',
    shouldShow: ({ data }) => data.format?.formatType !== 'POINTS' && data.format !== null,
    getDynamicProps: ({ data, editable }) => ({
      status: data.progress.rules ? 'COMPLETED' : 'PENDING',
      statusLabel: data.progress.rules ? 'Concluído' : 'Incompleto',
      isLocked: !editable,
    }),
  },
  {
    id: 'periods',
    title: 'Períodos',
    description: 'Inscrições e duração do campeonato.',
    icon: 'calendar_month',
    getDynamicProps: ({ data, editable }) => ({
      status: data.progress.period ? 'COMPLETED' : 'PENDING',
      statusLabel: data.progress.period ? 'Concluído' : 'Incompleto',
      isLocked: !editable,
    }),
  },
  {
    id: 'format',
    title: 'Formato e Estrutura',
    description: 'Grupos, eliminatórias e total de times.',
    icon: 'account_tree',
    getDynamicProps: ({ data, editable }) => ({
      status: data.progress.structure ? 'COMPLETED' : 'PENDING',
      statusLabel: data.progress.structure ? 'Concluído' : 'Incompleto',
      isLocked: !editable,
    }),
  },
  {
    id: 'match-rules',
    title: 'Configurações de Mata-Mata',
    description: 'Configurações de mata-mata do campeonato.',
    icon: 'shoe_cleats',
    shouldShow: ({ data }) => data.format?.formatType !== 'POINTS',
    getDynamicProps: ({ data, editable }) => ({
      status: data.progress.matchRules ? 'COMPLETED' : 'PENDING',
      statusLabel: data.progress.matchRules ? 'Concluído' : 'Incompleto',
      isLocked: !editable,
    }),
  },
  {
    id: 'bracket',
    title: 'Configuração de Chaveamento',
    description: 'Configuração de chaveamento do campeonato.',
    icon: 'flowchart',
    shouldShow: ({ data }) => data.format?.formatType !== 'POINTS',
    getDynamicProps: ({ data, editable }) => {
      const structureConfigured = data.structure !== null;
      if (!structureConfigured) {
        return {
          status: 'LOCKED' as const,
          statusLabel: 'Aguarda Estrutura',
          isLocked: true,
          actionLabel: 'Aguardando estrutura',
        };
      }
      return {
        status: data.progress.bracket ? 'COMPLETED' : 'PENDING',
        statusLabel: data.progress.bracket ? 'Concluído' : 'Incompleto',
        isLocked: !editable,
      };
    },
  },
  {
    id: 'teams',
    title: 'Times',
    description: 'Gerenciar inscrições e times participantes.',
    icon: 'groups_2',
    getDynamicProps: ({ data, editable }) => ({
      status: data.progress.teams ? 'COMPLETED' : 'PENDING',
      statusLabel: data.progress.teams ? 'Concluído' : 'Pendente',
      isLocked: !editable,
    }),
  },
  {
    id: 'seeding',
    title: 'Política de Seed',
    description: 'Critérios para definição de cabeças de chave.',
    icon: 'psychology',
    shouldShow: ({ data }) => data.format?.formatType !== 'POINTS',
    getDynamicProps: ({ data, editable }) => ({
      status: data.progress.seeding ? 'COMPLETED' : 'PENDING',
      statusLabel: data.progress.seeding ? 'Concluído' : 'Incompleto',
      isLocked: !editable,
    }),
  },
  {
    id: 'advanced-rules',
    title: 'Configurações Avançadas',
    description: 'Configurações avançadas do campeonato.',
    icon: 'settings',
    getDynamicProps: ({ data, editable }) => ({
      status: data.progress.settings ? 'COMPLETED' : 'PENDING',
      statusLabel: data.progress.settings ? 'Concluído' : 'Incompleto',
      isLocked: !editable,
    }),
  },
  {
    id: 'review',
    title: 'Revisão Final',
    description: 'Validação completa para ativação.',
    icon: 'verified',
    getDynamicProps: ({ data, editable }) => ({
      status: data.progress.review ? 'COMPLETED' : 'LOCKED',
      statusLabel: data.progress.review ? 'Pronto' : 'Bloqueado',
      isLocked: !editable || !data.canActivate,
      actionLabel: data.canActivate ? 'Revisar' : 'Aguardando etapas',
    }),
  },
];
