import { Injectable, signal } from '@angular/core';

export interface IToast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // em milissegundos, padrão 5000ms
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = signal<IToast[]>([]);

  /**
   * Obtém a lista de toasts ativos
   */
  getToasts() {
    return this.toasts.asReadonly();
  }

  /**
   * Exibe um toast
   * @param message Mensagem a ser exibida
   * @param type Tipo do toast
   * @param duration Duração em milissegundos (padrão: 5000ms)
   */
  show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 5000,
  ): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: IToast = { id, message, type, duration };

    // Adiciona o toast à lista
    this.toasts.update((current) => [...current, toast]);

    // Remove automaticamente após a duração especificada
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  /**
   * Remove um toast específico
   * @param id ID do toast a ser removido
   */
  remove(id: string): void {
    this.toasts.update((current) => current.filter((toast) => toast.id !== id));
  }

  /**
   * Remove todos os toasts
   */
  clear(): void {
    this.toasts.set([]);
  }

  /**
   * Métodos de conveniência para cada tipo
   */
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
}
