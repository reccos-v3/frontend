import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISchedulePreferences } from '../../../../interfaces/setup-types.interface';

@Component({
  selector: 'app-format-calendar-preferences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './format-calendar-preferences.html',
  styleUrl: './format-calendar-preferences.css',
})
export class FormatCalendarPreferences {
  isExpanded = false;

  weekDays: {
    id: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    label: string;
    selected: boolean;
  }[] = [
    { id: 'MONDAY', label: 'Segunda', selected: false },
    { id: 'TUESDAY', label: 'Terça', selected: false },
    { id: 'WEDNESDAY', label: 'Quarta', selected: false },
    { id: 'THURSDAY', label: 'Quinta', selected: false },
    { id: 'FRIDAY', label: 'Sexta', selected: false },
    { id: 'SATURDAY', label: 'Sábado', selected: false },
    { id: 'SUNDAY', label: 'Domingo', selected: false },
  ];

  timeSlots: {
    id: 'MORNING' | 'AFTERNOON' | 'EVENING';
    label: string;
    selected: boolean;
  }[] = [
    { id: 'MORNING', label: 'Manhã', selected: false },
    { id: 'AFTERNOON', label: 'Tarde', selected: false },
    { id: 'EVENING', label: 'Noite', selected: false },
  ];

  avoidHolidays = true;

  updatePreferences = output<ISchedulePreferences>();

  toggleExpansion() {
    this.isExpanded = !this.isExpanded;
  }

  toggleDay(dayId: string) {
    const day = this.weekDays.find((d) => d.id === dayId);
    if (day) {
      day.selected = !day.selected;
      this.emitChanges();
    }
  }

  toggleTimeSlot(slotId: string) {
    const slot = this.timeSlots.find((s) => s.id === slotId);
    if (slot) {
      slot.selected = !slot.selected;
      this.emitChanges();
    }
  }

  toggleHolidays() {
    this.avoidHolidays = !this.avoidHolidays;
    this.emitChanges();
  }

  private emitChanges() {
    this.updatePreferences.emit({
      allowedWeekDays: this.weekDays.filter((d) => d.selected).map((d) => d.id),
      preferredTimeSlots: this.timeSlots.filter((s) => s.selected).map((s) => s.id),
      avoidHolidays: this.avoidHolidays,
    });
  }
}
