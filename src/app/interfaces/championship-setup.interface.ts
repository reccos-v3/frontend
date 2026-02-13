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

export interface IFormatAndStructureRequest {
  totalTeams: number;
  groupsCount: number;
  qualifiedPerGroup: number;
  wildcardCount: number;
  schedulePreferences: ISchedulePreferences;
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
  transferWindowStartAt: string;
  transferWindowEndAt: string;
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
  technicalSource: 'GROUP_STAGE_RESULTS';
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
