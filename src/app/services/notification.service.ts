import { Injectable, signal } from '@angular/core';

export interface INotification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly NOTIFICATION_KEY = 'app_notification';

  /**
   * Exibe uma notificação
   * @param message Mensagem a ser exibida
   * @param type Tipo da notificação
   */
  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    const notification: INotification = { message, type };

    // Salva no sessionStorage para persistir após redirecionamento
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(this.NOTIFICATION_KEY, JSON.stringify(notification));
    }
  }

  /**
   * Obtém e remove a notificação do storage
   */
  getAndClear(): INotification | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem(this.NOTIFICATION_KEY);
      if (stored) {
        sessionStorage.removeItem(this.NOTIFICATION_KEY);
        return JSON.parse(stored);
      }
    }
    return null;
  }

  /**
   * Limpa a notificação
   */
  clear(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(this.NOTIFICATION_KEY);
    }
  }
}
