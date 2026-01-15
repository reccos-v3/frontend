export interface ISeasonRequest {
  name: string;
  endDate: string;
  startDate: string;
}

export interface ISeasonResponse {
  id: string;
  federationId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}
