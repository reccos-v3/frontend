import { Component, computed, inject, OnInit, output, input } from '@angular/core';
import { AppAlert } from '../../../../../../components/alert/alert';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { combineLatest, startWith } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-period-range-dates',
  standalone: true,
  imports: [AppAlert, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './period-range-dates.html',
  styleUrl: './period-range-dates.css',
})
export class PeriodRangeDates implements OnInit {
  private fb = inject(FormBuilder);

  validForm = output<boolean>();
  periodValues = output<{
    championshipPeriod: { startDate: string; endDate: string };
    registrationPeriod: { startAt: string; endAt: string };
  }>();

  initialValues = input<{
    championshipPeriod: { startDate: string; endDate: string };
    registrationPeriod: { startAt: string; endAt: string };
  } | null>(null);

  championshipPeriodForm!: FormGroup;
  registrationPeriodForm!: FormGroup;

  isValid = computed(() => {
    return this.championshipPeriodForm.valid && this.registrationPeriodForm.valid;
  });

  minDate = new Date().toISOString().split('T')[0];

  constructor() {
    this.championshipPeriodForm = this.fb.group({
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
    });

    this.registrationPeriodForm = this.fb.group({
      startAt: [null, [Validators.required]],
      endAt: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    const initial = this.initialValues();
    if (initial) {
      if (initial.championshipPeriod) {
        this.championshipPeriodForm.patchValue({
          startDate: initial.championshipPeriod.startDate.split('T')[0],
          endDate: initial.championshipPeriod.endDate.split('T')[0],
        });
      }
      if (initial.registrationPeriod) {
        this.registrationPeriodForm.patchValue({
          startAt: initial.registrationPeriod.startAt.split('T')[0],
          endAt: initial.registrationPeriod.endAt.split('T')[0],
        });
      }
    }
    this.monitorForms();
  }

  private monitorForms() {
    combineLatest([
      this.championshipPeriodForm.valueChanges.pipe(startWith(this.championshipPeriodForm.value)),
      this.championshipPeriodForm.statusChanges.pipe(startWith(this.championshipPeriodForm.status)),
      this.registrationPeriodForm.valueChanges.pipe(startWith(this.registrationPeriodForm.value)),
      this.registrationPeriodForm.statusChanges.pipe(startWith(this.registrationPeriodForm.status)),
    ]).subscribe(() => {
      const isValid = this.championshipPeriodForm.valid && this.registrationPeriodForm.valid;

      this.validForm.emit(isValid);

      if (isValid) {
        this.periodValues.emit({
          championshipPeriod: {
            startDate: this.toStartOfDay(this.championshipPeriodForm.value.startDate),
            endDate: this.toEndOfDay(this.championshipPeriodForm.value.endDate),
          },
          registrationPeriod: {
            startAt: this.toStartOfDay(this.registrationPeriodForm.value.startAt),
            endAt: this.toEndOfDay(this.registrationPeriodForm.value.endAt),
          },
        });
      }
    });
  }

  /** yyyy-MM-dd -> yyyy-MM-ddT00:00:00 */
  private toStartOfDay(date: string): string {
    return `${date}T00:00:00`;
  }

  /** yyyy-MM-dd -> yyyy-MM-ddT23:59:59 */
  private toEndOfDay(date: string): string {
    return `${date}T23:59:59`;
  }
}
