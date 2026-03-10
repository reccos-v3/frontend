import { SeedingTechnicalSource } from './setup-types.interface';

export interface IRulesAndScoringRequest {
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  hasHomeAway: boolean;
  tieBreakerOrder: ITieBreakerOrder[];
}

export interface IUpdateRulesAndScoringResponse {
  id: string;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  hasHomeAway: boolean;
  tieBreakerOrder: string[];
}

export interface ITieBreakerOrder {
  criteriaId: string;
  priorityOrder: number;
}

export interface IFormatRequest {
  formatType: 'GROUPS_AND_KNOCKOUT' | 'KNOCKOUT' | 'POINTS';
}

export interface IFormatAndStructureRequest {
  formatType: 'GROUPS_AND_KNOCKOUT' | 'KNOCKOUT' | 'POINTS' | 'GROUPS';
  totalTeams: number;
  groupsCount: number | null;
  qualifiedPerGroup: number | null;
  knockoutStartPhase: string | null;
  byesCount: number;
  firstPhaseType: string | null;
  wildcardCount: number;
  knockoutConfig: IKnockoutConfigRequest | null;
  schedulePreferences: ISchedulePreferences;
  byePolicy?: 'STANDARD' | 'MAX_ENGAGEMENT';
}

export interface IKnockoutConfigRequest {
  defaultLegs: number;
  defaultAdvanceRule: string;
  phases: IPhaseConfigRequest[] | null;
}

export interface IPhaseConfigRequest {
  phaseOrder: number;
  legs: number;
  advanceRule: string;
  phaseType: string;
}

export interface ISchedulePreferences {
  availability: IAvailability[];
  avoidHolidays: boolean;
}

export interface IAvailability {
  day: string;
  periods: string[];
}

export interface IPeriodsAndTransferWindowsRequest {
  startDate: string;
  endDate: string;
  registrationStartAt: string;
  registrationEndAt: string;
  transferWindowStartAt: string | null;
  transferWindowEndAt: string | null;
}

export interface IPeriodsAndTransferWindowsResponse {
  id: string;
  startDate: string;
  endDate: string;
  registrationStartAt: string;
  registrationEndAt: string;
  transferWindowStartAt: string | null;
  transferWindowEndAt: string | null;
}

export interface IBracketConfigRequest {
  strategyId: string;
  bracketModel: 'FIXED_BALANCED' | 'SEQUENTIAL' | 'DYNAMIC_RESEEDING' | 'MANUAL';
  isDynamicReseeding: boolean;
}

export interface ITeamSelectionRequest {
  teamIds: string[];
}

export interface ISeedingPoliciesRequest {
  type: 'RANKING' | 'DRAW' | 'HYBRID';
  mode: 'AUTOMATIC' | 'MANUAL';
  technicalSource: SeedingTechnicalSource | null;
  applicationContext: IApplicationContext;
}

export interface IApplicationContext {
  knockoutEntry: boolean;
  groupDistribution: boolean;
  preliminaryRounds: boolean;
}

export interface AdvancedSettingsRequest {
  allowRosterChanges: boolean;
  allowScheduleChanges: boolean;
  allowRuleChanges: boolean;
  activationMode: 'MANUAL' | 'AUTOMATIC';
}

export interface IMatchRulesRequest {
  defaultLegs: number;
  defaultAdvanceRule: string;
  phases: IMatchRulesPhase[];
}

export interface IMatchRulesPhase {
  phaseType: string;
  legs: number;
  advanceRule: string;
}

export interface IAdvancedSettingsRequest {
  allowRosterChanges: boolean;
  allowScheduleChanges: boolean;
  allowRuleChanges: boolean;
  activationMode: 'MANUAL' | 'AUTOMATIC';
}
