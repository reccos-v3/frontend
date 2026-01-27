import { Component } from '@angular/core';
import { AppAlert } from '../../../../components/alert/alert';
import { PeriodSidebar } from './components/period-sidebar/period-sidebar';
import { PeriodRangeDates } from './components/period-range-dates/period-range-dates';

@Component({
  selector: 'app-setup-periods',
  imports: [PeriodSidebar, PeriodRangeDates],
  templateUrl: './setup-periods.html',
  styleUrl: './setup-periods.css',
})
export class SetupPeriods {}
