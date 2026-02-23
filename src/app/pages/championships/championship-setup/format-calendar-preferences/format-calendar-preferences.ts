import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISchedulePreferences, IAvailability } from '../../../../interfaces/setup-types.interface';

@Component({
  selector: 'app-format-calendar-preferences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './format-calendar-preferences.html',
  styleUrl: './format-calendar-preferences.css',
})
export class FormatCalendarPreferences {
  initialPreferences = input<ISchedulePreferences | null>(null);
  updatePreferences = output<ISchedulePreferences>();

  private _initialized = false;

  constructor() {
    effect(() => {
      const prefs = this.initialPreferences();
      if (prefs && !this._initialized) {
        this._initialized = true;
        this.availabilities.set(prefs.availability || []);
        this.avoidHolidays.set(prefs.avoidHolidays ?? true);
      }
    });
  }

  // Auxiliares para renderização
  weekDays = [
    { id: 'MONDAY', label: 'Segunda' },
    { id: 'TUESDAY', label: 'Terça' },
    { id: 'WEDNESDAY', label: 'Quarta' },
    { id: 'THURSDAY', label: 'Quinta' },
    { id: 'FRIDAY', label: 'Sexta' },
    { id: 'SATURDAY', label: 'Sábado' },
    { id: 'SUNDAY', label: 'Domingo' },
  ] as const;

  timeSlots = [
    { id: 'MORNING', label: 'Manhã', icon: 'wb_twilight' },
    { id: 'AFTERNOON', label: 'Tarde', icon: 'light_mode' },
    { id: 'NIGHT', label: 'Noite', icon: 'dark_mode' },
    { id: 'ALL_DAY', label: 'Dia Todo', icon: 'schedule' },
  ] as const;

  // Estado das seleções temporais (para criação do par)
  selectedDay = signal<string | null>(null);
  selectedPeriod = signal<string | null>(null);

  // Lista de disponibilidades (pares e períodos)
  availabilities = signal<IAvailability[]>([]);
  avoidHolidays = signal(true);

  addAvailability() {
    const day = this.selectedDay() as IAvailability['day'];
    const period = this.selectedPeriod() as IAvailability['periods'][number];

    if (!day || !period) return;

    this.availabilities.update((prev) => {
      // Busca se já existe o dia na lista
      const existing = prev.find((a) => a.day === day);

      if (existing) {
        // Se já existe o dia, verifica se o período já está lá
        if (existing.periods.includes(period)) return prev;

        // Adiciona o período ao dia existente
        return prev.map((a) => (a.day === day ? { ...a, periods: [...a.periods, period] } : a));
      }

      // Se não existe o dia, cria um novo
      return [...prev, { day, periods: [period] }];
    });

    // Limpa a seleção após adicionar (opcional, mas bom para UX)
    // this.selectedPeriod.set(null);
    this.emitChanges();
  }

  removePeriod(day: string, period: string) {
    this.availabilities.update((prev) => {
      const updated = prev
        .map((a) => {
          if (a.day === day) {
            return { ...a, periods: a.periods.filter((p) => p !== period) };
          }
          return a;
        })
        .filter((a) => a.periods.length > 0);
      return updated;
    });
    this.emitChanges();
  }

  toggleHolidays() {
    this.avoidHolidays.update((v) => !v);
    this.emitChanges();
  }

  getDayLabel(dayId: string): string {
    return this.weekDays.find((d) => d.id === dayId)?.label || dayId;
  }

  getPeriodLabel(periodId: string): string {
    return this.timeSlots.find((p) => p.id === periodId)?.label || periodId;
  }

  private emitChanges() {
    this.updatePreferences.emit({
      availability: this.availabilities(),
      avoidHolidays: this.avoidHolidays(),
    });
  }
}
