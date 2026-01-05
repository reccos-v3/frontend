/**
 * Interface para requisição de login
 */
export interface ILoginRequest {
  email: string;
  password: string;
}

/**
 * Interface para resposta de autenticação do backend
 * Representa a estrutura exata retornada pelo endpoint auth/login
 */
export interface IAuth {
  accessToken: string;
  refreshToken: string;
  federationId: string;
  role: string;
}

