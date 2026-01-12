/**
 * Interface para requisição de validação de código de convite
 */
export interface IValidateInvitationCodeRequest {
  code: string;
}

/**
 * Interface para resposta de validação de convite
 */
export interface IValidateInvitationResponse {
  email: string;
  federationId: string;
  federationName: string;
  roleName: string;
  valid: boolean;
}

/**
 * Interface para requisição de ativação de convite
 */
export interface IActivateInvitationRequest {
  invitationToken: string;
  fullName: string;
  documentType: string;
  documentValue: string;
  password: string;
}

/**
 * Interface para resposta de ativação de convite
 */
export interface IActivateInvitationResponse {
  userId: string;
  email: string;
  role: string;
}
