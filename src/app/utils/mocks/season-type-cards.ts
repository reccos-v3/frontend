import { SeasonTypeCardConfig } from '../../pages/championships/championship-create/components/season-type-card/season-type-card';

export const seasonTypeCards: SeasonTypeCardConfig[] = [
  {
    type: 'existing',
    icon: 'event_available',
    title: 'Vincular Existente',
    description: 'Associar a uma temporada ativa que já foi cadastrada anteriormente.',
    showCheckmark: true,
    customContent: 'select',
  },
  {
    type: 'new',
    icon: 'add_circle',
    title: 'Criar Nova',
    description: 'Iniciar um novo ciclo de temporada agora mesmo de forma rápida.',
    customContent: 'inputs',
  },
  {
    type: 'standalone',
    icon: 'offline_bolt',
    title: 'Campeonato Avulso',
    description: 'Não vinculado a nenhuma temporada específica do calendário.',
    customContent: 'badge',
    badgeText: 'USO OCASIONAL',
  },
];
