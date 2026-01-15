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
  gender: string;
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
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  activatedAt: string;
  format: {
    id: string;
    formatType: string;
  };
  rules: {
    id: string;
    pointsWin: number;
    pointsDraw: number;
    pointsLoss: number;
    tieBreakerOrder: string[];
    hasHomeAway: boolean;
  };
  progress: {
    id: string;
    rulesDone: boolean;
    structureDone: boolean;
    teamsDone: boolean;
    reviewDone: boolean;
  };
  teamsCount: number;
}
