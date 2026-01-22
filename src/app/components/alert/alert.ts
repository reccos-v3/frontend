import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="containerClasses()" class="p-4 flex items-start gap-3">
      <span class="material-symbols-outlined mt-0.5" [ngClass]="iconClasses()">
        {{ icon() }}
      </span>
      <div>
        @if (title()) {
          <p class="text-sm font-bold mb-0.5" [ngClass]="titleClasses()">
            {{ title() }}
          </p>
        }
        <p class="text-sm leading-relaxed" [ngClass]="messageClasses()">
          {{ message() }}
        </p>
      </div>
    </div>
  `,
})
export class AppAlert {
  type = input<'info' | 'warning' | 'error' | 'success'>('info');
  variant = input<'full' | 'left-accent'>('full');
  title = input<string>();
  message = input.required<string>();
  icon = input<string>('info');

  // Helper para centralizar a lógica de cores
  private colorMap = computed(() => {
    const maps = {
      info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-500 dark:border-blue-400',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'text-blue-600 dark:text-blue-400',
      },
      warning: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-500 dark:border-orange-400',
        text: 'text-orange-800 dark:text-orange-200', // Ajustado para contraste
        icon: 'text-orange-600 dark:text-orange-400',
      },
      error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-500 dark:border-red-400',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-600 dark:text-red-400',
      },
      success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-500 dark:border-green-400',
        text: 'text-green-800 dark:text-green-200',
        icon: 'text-green-600 dark:text-green-400',
      },
    };
    return maps[this.type()];
  });

  containerClasses = computed(() => {
    const colors = this.colorMap();
    return {
      // Layout Base: Borda esquerda forte e bordas direitas sutis
      'border-l-[4px] shadow-sm': true,
      'rounded-r-lg rounded-l-none': true, // "Sutil" geralmente é lg ou md
      [colors.bg]: true,
      [colors.border]: true,
      // Se for full, mantemos o arredondamento padrão do container
      'rounded-xl': this.variant() === 'full',
    };
  });

  iconClasses = computed(() => this.colorMap().icon);

  titleClasses = computed(() => this.colorMap().text);

  messageClasses = computed(() => {
    const colors = this.colorMap();
    return `${colors.text} opacity-90 font-medium`;
  });
}
