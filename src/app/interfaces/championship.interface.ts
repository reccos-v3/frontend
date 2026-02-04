import {
  IActivationPolicy,
  IPostActivationRules,
  ISchedulePreferences,
  ISetupChampionshipPeriod,
  ISetupRegistrationPeriod,
  ISetupStructure,
  ISetupTiebreaks,
} from './setup-types.interface';

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
    basicsDone: boolean;
    periodDone: boolean;
    rulesDone: boolean;
    structureDone: boolean;
    seedingDone: boolean;
    teamsDone: boolean;
    reviewDone: boolean;
  };
  teamsCount: number;
  canActivate: boolean;
  structure: ISetupStructure | null;
  tiebreaks: ISetupTiebreaks | null;
  activationPolicy: IActivationPolicy | null;
  postActivationRules: IPostActivationRules | null;
  schedulePreferences: ISchedulePreferences | null;
  championshipPeriod: ISetupChampionshipPeriod | null;
  registrationPeriod: ISetupRegistrationPeriod | null;
  pendingSteps: IChampionshipPendingStep[];
}

export interface IChampionshipStatisticsCard {
  totalChampionships: number;
  totalInProgress: number;
  totalDrafts: number;
  totalTeams: number;
}

export type IChampionshipPendingStep = 'RULES' | 'FORMAT' | 'STRUCTURE' | 'PERIOD' | 'TEAMS';
