export type SetupStep = 'rules' | 'periods' | 'format' | 'teams' | 'final_review';
export type StepStatus = 'completed' | 'in-progress' | 'pending';

export interface ISetupBasics {
  name: string;
  modalityId: string;
  gender: string;
  type: string;
  seasonId: string;
}

export interface ISetupRules {
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  hasHomeAway: boolean;
}

export interface ISetupFormat {
  formatType: string;
  knockoutConfig?: IKnockoutConfig;
}

export interface IKnockoutConfig {
  defaultLegs: number;
  defaultAdvanceRule: 'REGULAR_OR_PENALTIES' | 'AGGREGATE_OR_PENALTIES';
  phases: IPhaseOverride[];
}

export interface IPhaseOverride {
  phaseOrder: number;
  legs: number;
  advanceRule: 'REGULAR_OR_PENALTIES' | 'AGGREGATE_OR_PENALTIES';
}

export interface IPhaseConfig {
  order: number;
  name: string;
  matchType: 'single' | 'home_away';
  legs: number;
  advanceRule?: 'REGULAR_OR_PENALTIES' | 'AGGREGATE_OR_PENALTIES';
  teamsCount: number;
  isPreliminary: boolean;
}

export interface ISetupStructure {
  totalTeams: number;
  groupsCount: number;
  qualifiedPerGroup: number;
  firstPhaseType: string;
}

export interface ISetupTiebreakCriteria {
  criteriaId: string;
  priorityOrder: number;
}

export interface ISetupTiebreaks {
  criteria: ISetupTiebreakCriteria[];
}

export interface ISetupTeams {
  teamIds: string[];
}

export interface ISetupChampionshipPeriod {
  startDate: string;
  endDate: string;
}

export interface ISetupRegistrationPeriod {
  startAt: string;
  endAt: string;
}

export interface IActivationPolicy {
  mode: 'MANUAL' | 'AUTOMATIC';
  autoActivateAt: string | null;
}

export interface IPostActivationRules {
  allowTeamChanges: boolean;
  allowScheduleChanges: boolean;
  allowRuleChanges: boolean;
}

export interface ISchedulePreferences {
  allowedWeekDays: (
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY'
  )[];
  preferredTimeSlots: ('MORNING' | 'AFTERNOON' | 'EVENING')[];
  avoidHolidays: boolean;
}

export interface IChampionshipSetupRequest {
  basics?: ISetupBasics;
  rules?: ISetupRules;
  format?: ISetupFormat;
  structure?: ISetupStructure;
  tiebreaks?: ISetupTiebreaks;
  teams?: ISetupTeams;
  championshipPeriod?: ISetupChampionshipPeriod;
  registrationPeriod?: ISetupRegistrationPeriod;
  activate?: boolean;
  activationPolicy?: IActivationPolicy;
  postActivationRules?: IPostActivationRules;
  schedulePreferences?: ISchedulePreferences;
}
