/**
 * Interface para erros retornados pela API
 */
export interface IApiError {
  status: number;
  message: string;
  timestamp: string;
  errors?: {
    [key: string]: string;
  };
}

/**
 * Interface para resposta de erro HTTP que contém um IApiError no campo error.
 */
export interface IHttpApiErrorResponse {
  headers: {
    headers: Record<string, unknown>;
    normalizedNames: Record<string, unknown>;
    lazyUpdate: unknown;
  };
  status: number;
  statusText: string;
  url: string;
  ok: boolean;
  redirected: boolean;
  responseType: string;
  name: string;
  message: string;
  error: IApiError;
}
