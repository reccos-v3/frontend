export type IconKey = 'TROPHY' | 'CROSS' | 'DICE';
export type TournamentFormat = 'GROUPS_AND_KNOCKOUT' | 'KNOCKOUT';

export interface IPairingStrategiesResponse {
  id: string;
  name: string;
  description: string;
  iconKey: IconKey;
  supportedFormats: TournamentFormat[];
  requiresConfig: boolean;
}
