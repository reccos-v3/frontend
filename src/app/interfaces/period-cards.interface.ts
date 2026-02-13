export interface IPeriodCardConfig {
  key: string;
  title: string;
  icon: string;
  description: string;
  labelStart: string;
  labelEnd: string;
  inputType: 'date' | 'datetime-local';
  iconStart?: string;
  iconEnd?: string;
  impactMessage: string;
  infoTooltip: string;
  enabled?: boolean;
}
