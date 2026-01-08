import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-card.component.html',
  styleUrl: './action-card.component.css',
})
export class ActionCardComponent {
  title = input.required<string>();
  description = input.required<string>();
  icon = input.required<string>();
  color = input<string>('primary'); // Default to primary

  themeClasses = computed(() => {
    const color = this.color();
    const themes: Record<string, any> = {
      primary: {
        container: 'hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-primary/5',
        iconBg: 'bg-primary/20 group-hover:bg-primary/60',
        iconColor: 'text-primary group-hover:text-background-dark',
        titleColor: 'group-hover:text-primary dark:group-hover:text-primary',
      },
      info: {
        container: 'hover:border-info/40 dark:hover:border-info/40 hover:shadow-info/5',
        iconBg: 'bg-info/10 group-hover:bg-info',
        iconColor: 'text-info group-hover:text-white',
        titleColor: 'group-hover:text-info dark:group-hover:text-info',
      },
      warning: {
        container: 'hover:border-warning/40 dark:hover:border-warning/40 hover:shadow-warning/5',
        iconBg: 'bg-warning/10 group-hover:bg-warning',
        iconColor: 'text-warning-dark group-hover:text-white', // Assuming text-warning might be too light, using basic text-warning for now or custom
        titleColor: 'group-hover:text-warning dark:group-hover:text-warning',
      },
      danger: {
        container: 'hover:border-danger/40 dark:hover:border-danger/40 hover:shadow-danger/5',
        iconBg: 'bg-danger/10 group-hover:bg-danger',
        iconColor: 'text-danger group-hover:text-white',
        titleColor: 'group-hover:text-danger dark:group-hover:text-danger',
      },
      secondary: {
        container:
          'hover:border-secondary/40 dark:hover:border-secondary/40 hover:shadow-secondary/5',
        iconBg: 'bg-secondary/10 group-hover:bg-secondary',
        iconColor: 'text-secondary group-hover:text-white',
        titleColor: 'group-hover:text-secondary dark:group-hover:text-secondary',
      },
    };
    return themes[color] || themes['primary'];
  });
}
