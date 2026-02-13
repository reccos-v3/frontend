import {
  IAdvancedSettingsRequest,
  IUpdateRulesAndScoringResponse,
} from './championship-setup.interface';
import {
  IActivationPolicy,
  IPostActivationRules,
  ISchedulePreferences,
  ISetupChampionshipPeriod,
  ISetupRegistrationPeriod,
  ISetupStructure,
} from './setup-types.interface';

export interface IChampionshipRequest {
  name: string;
  modalityId: string;
  gender: string;
  type: string;
  seasonId: string | null;
}

export interface IChampionshipModality {
  id: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export interface IChampionshipSeason {
  id: string;
  federationId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITieBreakerOrder {
  criteriaId: string;
  priorityOrder: number;
}

export interface IChampionshipResponse {
  id: string;
  federationId: string;
  name: string;
  modality: IChampionshipModality;
  gender: 'MALE' | 'FEMALE' | 'MIXED';
  type: 'SEASONAL' | string;
  season: IChampionshipSeason | null;
  championshipPeriod: ISetupChampionshipPeriod | null;
  registrationPeriod: ISetupRegistrationPeriod | null;
  transferWindowPeriod: ISetupRegistrationPeriod | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
  format: {
    id: string;
    formatType: 'KNOCKOUT' | 'GROUPS_AND_KNOCKOUT' | 'POINTS';
  } | null;
  structure: ISetupStructure | null;
  rules: IUpdateRulesAndScoringResponse | null;
  tiebreaks: ITieBreakerOrder[] | null;
  activationPolicy: IActivationPolicy | null;
  postActivationRules: IPostActivationRules | null;
  schedulePreferences: ISchedulePreferences | null;
  seedingPolicy: ISeedingPolicyResponse | null;
  settings: IAdvancedSettingsRequest | null;
  progress: IChampionshipProgress;
  teamsCount: number;
  pendingSteps: IChampionshipPendingStep[];
  canActivate: boolean;
}

export interface IChampionshipProgress {
  id: string;
  basicsDone: boolean;
  periodDone: boolean;
  rulesDone: boolean;
  formatDone: boolean;
  structureDone: boolean;
  teamsDone: boolean;
  tiebreaksDone: boolean;
  registrationDone: boolean;
  scheduleDone: boolean;
  activationDone: boolean;
  postActivationDone: boolean;
  seedingDone: boolean;
  reviewDone: boolean;
}

export type IChampionshipPendingStep =
  | 'RULES'
  | 'FORMAT'
  | 'STRUCTURE'
  | 'PERIOD'
  | 'TEAMS'
  | 'SEEDING'
  | 'TIEBREAKS'
  | 'REGISTRATION'
  | 'SCHEDULE'
  | 'ACTIVATION'
  | 'POST_ACTIVATION'
  | 'REVIEW';

export interface IChampionshipStatisticsCard {
  totalChampionships: number;
  totalInProgress: number;
  totalDrafts: number;
  totalTeams: number;
}

export type SeedingTechnicalSource =
  | 'GROUP_STAGE_RESULT'
  | 'EXTERNAL_RANKING'
  | 'HISTORICAL_PERFORMANCE'
  | 'PURE_RANDOM';

export interface ISeedingPolicyResponse {
  id: string;
  championshipId: string;
  type: 'RANKING' | 'DRAW' | 'HYBRID';
  mode: 'AUTOMATIC' | 'MANUAL';
  technicalSource: SeedingTechnicalSource;
  applicationContext: IApplicationContext;
  audit: ISeedingAudit;
  createdAt: string;
  updatedAt: string;
}

export interface IApplicationContext {
  knockoutEntry: boolean;
  groupDistribution: boolean;
  preliminaryRounds: boolean;
}

export interface ISeedingAudit {
  definedBy: string | null;
  createdAt: string | null;
  status: 'DRAFT' | 'FROZEN';
  freezesTrigger: 'ACTIVE';
}
