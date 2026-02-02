import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-confirmation',
  standalone: true,
  imports: [],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div
          class="bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all"
        >
          <div class="p-6">
            <h3 class="text-xl font-bold text-[#111814] dark:text-white mb-2">{{ title() }}</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ message() }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-white/5 px-6 py-4 flex justify-end gap-3">
            <button
              (click)="cancel.emit()"
              class="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="confirm.emit()"
              class="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-sm"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalConfirmation {
  isOpen = input.required<boolean>();
  title = input<string>('Confirmação');
  message = input.required<string>();

  confirm = output<void>();
  cancel = output<void>();
}
