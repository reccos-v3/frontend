import { HttpErrorResponse } from '@angular/common/http';
import { IApiError } from '../components/interfaces/error.interface';
import { ToastService } from '../services/toast.service';

/**
 * Utilitário para tratar erros de validação da API
 * Formato esperado: { message: string, errors: { [key: string]: string }, status: number, timestamp: string }
 */
export class ErrorHandlerUtil {
  /**
   * Trata erros de validação da API e exibe no toast
   * @param error Erro HTTP da API
   * @param toastService Serviço de toast para exibir mensagens
   * @param defaultMessage Mensagem padrão caso não consiga extrair do erro
   */
  static handleApiError(
    error: HttpErrorResponse,
    toastService: ToastService,
    defaultMessage: string = 'Ocorreu um erro. Tente novamente.'
  ): void {
    try {
      const apiError = error.error as IApiError;

      // Se houver erros específicos por campo, exibe todos eles
      if (apiError.errors && Object.keys(apiError.errors).length > 0) {
        const errorMessages = Object.values(apiError.errors);
        // Combina todas as mensagens de erro em uma única mensagem
        const combinedMessage = errorMessages.join('; ');
        toastService.error(combinedMessage);
      } else if (apiError.message) {
        // Se houver apenas mensagem geral, usa ela
        toastService.error(apiError.message);
      } else {
        // Fallback para mensagem padrão
        toastService.error(defaultMessage);
      }
    } catch {
      // Se não conseguir parsear o erro, exibe mensagem padrão
      toastService.error(defaultMessage);
    }
  }

  /**
   * Extrai a mensagem de erro do formato da API
   * @param error Erro HTTP da API
   * @param defaultMessage Mensagem padrão caso não consiga extrair
   * @returns Mensagem de erro extraída
   */
  static extractErrorMessage(
    error: HttpErrorResponse,
    defaultMessage: string = 'Ocorreu um erro. Tente novamente.'
  ): string {
    try {
      const apiError = error.error as IApiError;

      // Se houver erros específicos por campo, retorna a primeira ou todas combinadas
      if (apiError.errors && Object.keys(apiError.errors).length > 0) {
        const errorMessages = Object.values(apiError.errors);
        return errorMessages.join('; ');
      }

      // Se houver apenas mensagem geral, retorna ela
      if (apiError.message) {
        return apiError.message;
      }

      // Fallback para mensagem padrão
      return defaultMessage;
    } catch {
      // Se não conseguir parsear o erro, retorna mensagem padrão
      return defaultMessage;
    }
  }
}
