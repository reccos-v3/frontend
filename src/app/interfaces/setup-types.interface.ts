export type SetupStep = 'rules' | 'periods' | 'format' | 'teams' | 'seeding' | 'final_review';
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

export type FormatType = 'KNOCKOUT' | 'GROUPS_AND_KNOCKOUT' | 'POINTS' | 'GROUPS';

export interface ISetupFormat {
  id?: string;
  formatType: FormatType;
}

export interface IKnockoutConfig {
  defaultLegs: number;
  defaultAdvanceRule: string;
  phases: IPhaseOverride[] | null;
}

export interface IPhaseOverride {
  phaseOrder: number;
  legs: number;
  advanceRule: string;
  phaseType?: string;
}

export interface IPhaseConfig {
  order: number;
  name: string;
  matchType: 'single' | 'home_away';
  legs: number;
  advanceRule?: string;
  teamsCount: number;
  isPreliminary: boolean;
}

export const KNOCKOUT_PHASE_SLOTS: Record<string, number> = {
  FINAL: 2,
  SEMI_FINALS: 4,
  QUARTER_FINALS: 8,
  ROUND_OF_16: 16,
  ROUND_OF_32: 32,
  ROUND_OF_64: 64,
  ROUND_OF_128: 128,
  ROUND_OF_256: 256,
  ROUND_OF_512: 512,
};

export const getKnockoutPhaseName = (slots: number): string => {
  switch (slots) {
    case 2:
      return 'Grande Final';
    case 4:
      return 'Semifinal';
    case 8:
      return 'Quartas de Final';
    case 16:
      return 'Oitavas de Final';
    case 32:
      return '16 avos de Final';
    case 64:
      return '32 avos de Final';
    case 128:
      return '64 avos de Final';
    case 256:
      return '128 avos de Final';
    case 512:
      return '256 avos de Final';
    default:
      return `${slots} Equipes`;
  }
};

export const getKnockoutPhaseKey = (slots: number): string | null => {
  return (
    Object.keys(KNOCKOUT_PHASE_SLOTS).find((key) => KNOCKOUT_PHASE_SLOTS[key] === slots) || null
  );
};

export interface ISetupStructure {
  id?: string;
  formatType?: FormatType;
  byesCount: number;
  totalTeams: number;
  groupsCount: number | null;
  qualifiedPerGroup: number | null;
  knockoutStartPhase: string | null;
  wildcardCount: number;
  firstPhaseType: string | null;
  knockoutConfig?: IKnockoutConfig | null;
  byePolicy?: 'STANDARD' | 'MAX_ENGAGEMENT';
}

export interface ISetupTiebreakCriteria {
  criteriaId: string;
  priorityOrder: number;
}

export interface ISetupTiebreaks {
  criteria: ISetupTiebreakCriteria[];
}

export type ISetupTeams = string[];

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

export interface IAvailability {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  periods: ('MORNING' | 'AFTERNOON' | 'NIGHT' | 'ALL_DAY')[];
}

export interface ISchedulePreferences {
  availability: IAvailability[];
  avoidHolidays: boolean;
}

export interface IChampionshipSetupRequest {
  basics?: ISetupBasics;
  rules?: ISetupRules;
  format?: ISetupFormat;
  knockoutConfig?: IKnockoutConfig;
  structure?: ISetupStructure;
  tiebreaks?: ISetupTiebreaks;
  teams?: ISetupTeams;
  championshipPeriod?: ISetupChampionshipPeriod;
  registrationPeriod?: ISetupRegistrationPeriod;
  activate?: boolean;
  activationPolicy?: IActivationPolicy;
  postActivationRules?: IPostActivationRules;
  schedulePreferences?: ISchedulePreferences;
  seeding?: ISeedingConfig;
  seedPolicy?: ISeedPolicy;
}

export interface ISeedingResult {
  position: number;
  teamId: string;
  teamName: string;
  metadata?: string; // Bye, etc.
}

export type SeedingPolicyType = 'RANKING' | 'DRAW' | 'HYBRID';
export type SeedingDecisionMode = 'AUTOMATIC' | 'MANUAL';
export type SeedingTechnicalSource =
  | 'GROUP_STAGE_RESULT'
  | 'EXTERNAL_RANKING'
  | 'HISTORICAL_PERFORMANCE'
  | 'PURE_RANDOM';

export interface ISeedingApplicationContext {
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

export interface ISeedPolicy {
  type: SeedingPolicyType;
  mode: SeedingDecisionMode;
  technicalSource: SeedingTechnicalSource | null;
  applicationContext: ISeedingApplicationContext;
  audit?: ISeedingAudit;
}

export interface ISeedingConfig {
  type: 'RANKING' | 'TECHNICAL_SEED' | 'DRAW';
  mode: 'AUTOMATIC' | 'MANUAL';
  targetPhaseId?: string;
  criteria?: string[];
  globalSeed?: string;
  // results: ISeedingResult[];
  // justification?: string;
  policyType?: SeedingPolicyType;
  technicalSource?: SeedingTechnicalSource;
  applicationContext?: ISeedingApplicationContext;
  audit?: ISeedingAudit;
}
