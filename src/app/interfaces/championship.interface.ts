export interface IChampionshipRequest {
  name: string;
  modalityId: string;
  gender: string;
  type: string;
  seasonId: string | null;
}

export interface IChampionshipResponse {
  id: string;
  federationId: string;
  name: string;
  modalityId: string;
  modality: {
    id: string;
    code: string;
    name: string;
    description: string;
    active: boolean;
  };
  gender: 'MALE' | 'FEMALE' | 'MIXED';
  type: string;
  season: {
    id: string;
    federationId: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
  format: {
    id: string;
    formatType: string;
  } | null;
  rules: {
    id: string;
    pointsWin: number;
    pointsDraw: number;
    pointsLoss: number;
    hasHomeAway: boolean;
  } | null;
  progress: {
    id: string;
    rulesDone: boolean;
    structureDone: boolean;
    teamsDone: boolean;
    reviewDone: boolean;
  };
  teamsCount: number;
}

export interface IChampionshipStatisticsCard {
  totalChampionships: number;
  totalInProgress: number;
  totalDrafts: number;
  totalTeams: number;
}
