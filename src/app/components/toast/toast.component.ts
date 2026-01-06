import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, IToast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  toast = input.required<IToast>();
  toastService = input.required<ToastService>();

  getIconClass(): string {
    const type = this.toast().type;
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-orange-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }

  getContainerClass(): string {
    const type = this.toast().type;
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  }

  getIconName(): string {
    const type = this.toast().type;
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  getTitle(): string {
    const type = this.toast().type;
    switch (type) {
      case 'success':
        return 'Sucesso';
      case 'error':
        return 'Erro';
      case 'warning':
        return 'Aviso';
      case 'info':
        return 'Informação';
      default:
        return 'Notificação';
    }
  }

  onClose(): void {
    this.toastService().remove(this.toast().id);
  }
}
