import { Component, input, output, signal } from '@angular/core';
import { PeriodSidebar } from './components/period-sidebar/period-sidebar';
import { PeriodRangeDates } from './components/period-range-dates/period-range-dates';
import { IChampionshipSetupRequest, SetupStep } from '../../../../interfaces/setup-types.interface';

@Component({
  selector: 'app-setup-periods',
  imports: [PeriodSidebar, PeriodRangeDates],
  templateUrl: './setup-periods.html',
  styleUrl: './setup-periods.css',
})
export class SetupPeriods {
  data = input<IChampionshipSetupRequest>();

  valid = output<boolean>();
  advanced = output<SetupStep>();
  dataUpdate = output<Partial<IChampionshipSetupRequest>>();

  isValid = signal(false);
  tempValues = signal<{
    championshipPeriod: { startDate: string; endDate: string };
    registrationPeriod: { startAt: string; endAt: string };
  } | null>(null);

  handlePeriodValues(values: {
    championshipPeriod: { startDate: string; endDate: string };
    registrationPeriod: { startAt: string; endAt: string };
  }) {
    this.tempValues.set(values);
  }

  saveAndContinue() {
    if (this.isValid() && this.tempValues()) {
      this.dataUpdate.emit(this.tempValues()!);
      this.advanced.emit('format');
    }
  }
}
