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

