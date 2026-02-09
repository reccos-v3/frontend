import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PeriodSidebar } from './components/period-sidebar/period-sidebar';
import { PeriodRangeDates } from './components/period-range-dates/period-range-dates';
import { ChampionshipService } from '../../../../services/championship.service';
import { ChampionshipStore } from '../../../../services/championship.store';

@Component({
  selector: 'app-setup-periods',
  standalone: true,
  imports: [PeriodSidebar, PeriodRangeDates],
  templateUrl: './setup-periods.html',
  styleUrl: './setup-periods.css',
})
export class SetupPeriods implements OnInit {
  private router = inject(Router);
  private championshipStore = inject(ChampionshipStore);
  private championshipService = inject(ChampionshipService);

  // ─────────────────────────────────────────────
  // STORE STATE
  // ─────────────────────────────────────────────
  championship = this.championshipStore.championship;
  canEdit = this.championshipStore.canEdit;
  loading = signal(false);

  // ─────────────────────────────────────────────
  // LOCAL (TEMP) STATE
  // ─────────────────────────────────────────────
  isValid = signal(false);

  tempValues = signal<{
    championshipPeriod: { startDate: string; endDate: string };
    registrationPeriod: { startAt: string; endAt: string };
  } | null>(null);

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  ngOnInit(): void {
    const data = this.championship();
    if (!data) return;

    // Clone local (NUNCA editar direto a store)
    if (data.championshipPeriod && data.registrationPeriod) {
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

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────
  handlePeriodValues(values: {
    championshipPeriod: { startDate: string; endDate: string };
    registrationPeriod: { startAt: string; endAt: string };
  }) {
    this.tempValues.set(values);
  }

  handleValidity(valid: boolean) {
    this.isValid.set(valid);
  }

  // ─────────────────────────────────────────────
  // SAVE FLOW (PADRÃO OFICIAL)
  // ─────────────────────────────────────────────
  saveAndContinue(): void {
    const values = this.tempValues();
    const championship = this.championship();

    if (!this.isValid() || !values || !championship) return;

    this.loading.set(true);
    this.championshipStore.replace({
      ...championship,
      championshipPeriod: values.championshipPeriod,
      registrationPeriod: values.registrationPeriod,
    });

    // Volta para o setup principal (SEM refetch)
    this.router.navigate(['/admin/championships/setup', championship.id]);

    // this.championshipService
    //   .updateChampionship(championship.id, {
    //     championshipPeriod: values.championshipPeriod,
    //     registrationPeriod: values.registrationPeriod,
    //   })
    //   .subscribe({
    //     next: (updated: IChampionshipResponse) => {
    //       // 🔑 Atualiza a store (fonte da verdade)
    //       this.championshipStore.replace(updated);

    //       // Volta para o setup principal (SEM refetch)
    //       this.router.navigate(['/admin/championships/setup', championship.id]);
    //     },
    //     error: (err) => {
    //       console.error('Erro ao salvar períodos', err);
    //       this.loading.set(false);
    //     },
    //   });
  }

  // ─────────────────────────────────────────────
  // CANCEL
  // ─────────────────────────────────────────────
  goBack(): void {
    const championship = this.championship();
    if (!championship) return;

    this.router.navigate(['/admin/championships/setup', championship.id]);
  }
}
