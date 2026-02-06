import { Component, input, output, signal, OnInit } from '@angular/core';
import { PeriodSidebar } from './components/period-sidebar/period-sidebar';
import { PeriodRangeDates } from './components/period-range-dates/period-range-dates';
import { SetupStep } from '../../../../interfaces/setup-types.interface';
import { IChampionshipResponse } from '../../../../interfaces/championship.interface';

@Component({
  selector: 'app-setup-periods',
  standalone: true,
  imports: [PeriodSidebar, PeriodRangeDates],
  templateUrl: './setup-periods.html',
  styleUrl: './setup-periods.css',
})
export class SetupPeriods implements OnInit {
  data = input<IChampionshipResponse>();

  valid = output<boolean>();
  advanced = output<SetupStep>();
  dataUpdate = output<Partial<IChampionshipResponse>>();

  isValid = signal(false);
  tempValues = signal<{
    championshipPeriod: { startDate: string; endDate: string };
    registrationPeriod: { startAt: string; endAt: string };
  } | null>(null);

  ngOnInit() {
    const data = this.data();
    if (data?.championshipPeriod && data?.registrationPeriod) {
      this.tempValues.set({
        championshipPeriod: {
          startDate: data.championshipPeriod.startDate,
          endDate: data.championshipPeriod.endDate,
        },
        registrationPeriod: {
          startAt: data.registrationPeriod.startAt,
          endAt: data.registrationPeriod.endAt,
        },
      });
    }
  }

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
