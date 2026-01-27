import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-period-sidebar',
  imports: [DatePipe],
  templateUrl: './period-sidebar.html',
  styleUrl: './period-sidebar.css',
})
export class PeriodSidebar {
  tempValues = input<{
    championshipPeriod: { startDate: string; endDate: string };
    registrationPeriod: { startAt: string; endAt: string };
  } | null>();

  dateNow = new Date();
}
