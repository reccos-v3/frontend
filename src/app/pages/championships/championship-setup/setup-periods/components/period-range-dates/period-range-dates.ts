import { Component, computed, inject, OnInit, output } from '@angular/core';
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

  championshipPeriodForm!: FormGroup;
  registrationPeriodForm!: FormGroup;

  isValid = computed(() => {
    return this.championshipPeriodForm.valid && this.registrationPeriodForm.valid;
  });

  minDate = new Date().toISOString().split('T')[0];

  constructor() {
    this.championshipPeriodForm = this.fb.group({
      startDate: [this.minDate, [Validators.required]],
      endDate: [this.minDate, [Validators.required]],
    });
    this.registrationPeriodForm = this.fb.group({
      startAt: [this.minDate, [Validators.required]],
      endAt: [this.minDate, [Validators.required]],
    });
  }

  ngOnInit(): void {
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
          championshipPeriod: this.championshipPeriodForm.value,
          registrationPeriod: this.registrationPeriodForm.value,
        });
      }
    });
  }
}
