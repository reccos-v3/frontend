export type SetupStep = 'rules' | 'format' | 'teams' | 'final-review';
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
  tieBreakerOrder: string[]; // Codes or IDs of tiebreakers
}

export interface ISetupFormat {
  formatType: string;
}

export interface ISetupStructure {
  totalTeams: number;
  groupsCount: number;
  qualifiedPerGroup: number;
  knockoutStartPhase: string;
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

export interface IChampionshipSetupRequest {
  basics?: ISetupBasics;
  rules?: ISetupRules;
  format?: ISetupFormat;
  structure?: ISetupStructure;
  tiebreaks?: ISetupTiebreaks;
  teams?: ISetupTeams;
  activate?: boolean;
}
