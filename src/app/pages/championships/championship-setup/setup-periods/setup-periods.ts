import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PeriodCard } from './components/period-card/period-card';
import { ChampionshipService } from '../../../../services/championship.service';
import { ChampionshipStore } from '../../../../services/championship.store';
import { IPeriodCardConfig } from '../../../../interfaces/period-cards.interface';
import { tournamentConfigs } from '../../../../utils/periods-card/period-cards-items';
import { SetupFooterButtons } from '../setup-footer-buttons/setup-footer-buttons';
import { ChampionshipSetupService } from '../../../../services/championship-setup.service';
import { SetupAdvancedRules } from '../setup-advanced-rules/setup-advanced-rules';
import { AppAlert } from '../../../../components/alert/alert';
import { AppModal } from '../../../../components/modal/modal';
import {
  IAdvancedSettingsRequest,
  IPeriodsAndTransferWindowsRequest,
} from '../../../../interfaces/championship-setup.interface';

@Component({
  selector: 'app-setup-periods',
  standalone: true,
  imports: [PeriodCard, SetupFooterButtons, SetupAdvancedRules, AppAlert, AppModal],
  templateUrl: './setup-periods.html',
  styleUrl: './setup-periods.css',
})
export class SetupPeriods implements OnInit {
  private router = inject(Router);
  private championshipStore = inject(ChampionshipStore);
  private championshipService = inject(ChampionshipService);
  private championshipSetupService = inject(ChampionshipSetupService);

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
  showAdvancedModal = signal(false);

  isTransferBlocked = computed(() => {
    const data = this.championship();
    return !(data?.settings?.allowRosterChanges ?? false);
  });

  configs = computed<IPeriodCardConfig[]>(() => {
    const data = this.championship();
    const allowRosterChanges = data?.settings?.allowRosterChanges ?? false;

    return tournamentConfigs.map((config) => {
      if (config.key === 'transferPeriod') {
        return {
          ...config,
          enabled: allowRosterChanges,
        };
      }
      return {
        ...config,
        enabled: true,
      };
    });
  });

  cardValidities = new Map<string, boolean>();

  tempValues = signal<IPeriodsAndTransferWindowsRequest>({
    startDate: '',
    endDate: '',
    registrationStartAt: '',
    registrationEndAt: '',
    transferWindowStartAt: '',
    transferWindowEndAt: '',
  });

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  ngOnInit(): void {
    const data = this.championship();
    if (!data) return;

    this.tempValues.set({
      startDate: data.championshipPeriod?.startDate || '',
      endDate: data.championshipPeriod?.endDate || '',
      registrationStartAt: data.registrationPeriod?.startAt || '',
      registrationEndAt: data.registrationPeriod?.endAt || '',
      transferWindowStartAt: data.transferWindowPeriod?.startAt || '',
      transferWindowEndAt: data.transferWindowPeriod?.endAt || '',
    });
  }

  getInitialDate(key: string, type: 'start' | 'end'): string {
    const data = this.championship();
    if (!data) return '';

    if (key === 'championshipPeriod' && data.championshipPeriod) {
      return type === 'start' ? data.championshipPeriod.startDate : data.championshipPeriod.endDate;
    }

    if (key === 'registrationPeriod' && data.registrationPeriod) {
      return type === 'start' ? data.registrationPeriod.startAt : data.registrationPeriod.endAt;
    }

    if (key === 'transferPeriod' && data.transferWindowPeriod) {
      return type === 'start' ? data.transferWindowPeriod.startAt : data.transferWindowPeriod.endAt;
    }

    return '';
  }

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────
  handleValidity(key: string, values: { start: string; end: string } | boolean) {
    if (typeof values === 'boolean') return;

    const periodValues = values as { start: string; end: string };

    const isValid = !!periodValues.start && !!periodValues.end;
    this.cardValidities.set(key, isValid);

    const current = { ...this.tempValues() };

    if (key === 'championshipPeriod') {
      current.startDate = periodValues.start;
      current.endDate = periodValues.end;
    } else if (key === 'registrationPeriod') {
      current.registrationStartAt = periodValues.start;
      current.registrationEndAt = periodValues.end;
    } else if (key === 'transferPeriod') {
      current.transferWindowStartAt = periodValues.start;
      current.transferWindowEndAt = periodValues.end;
    }

    this.tempValues.set(current);

    const allValid = this.configs().every((config) => {
      // Período de transferência é opcional
      if (config.key === 'transferPeriod') return true;
      return this.cardValidities.get(config.key);
    });
    this.isValid.set(allValid);
  }

  handleAdvancedRulesChange(settings: IAdvancedSettingsRequest) {
    const championship = this.championship();
    if (!championship) return;

    // Só atualiza se houver mudança real para evitar loops
    if (JSON.stringify(championship.settings) === JSON.stringify(settings)) return;

    this.championshipSetupService.updateSettings(championship.id, settings).subscribe({
      next: (updatedSettings) => {
        this.championshipStore.update({ settings: updatedSettings });
      },
      error: (err) => console.error('Erro ao atualizar configurações avançadas', err),
    });
  }

  eventClickConfirmButton(event: 'saveAndContinue' | 'returnHub') {
    if (event === 'saveAndContinue') {
      this.saveAndContinue();
    } else {
      this.goBack();
    }
  }

  // ─────────────────────────────────────────────
  // SAVE FLOW (PADRÃO OFICIAL)
  // ─────────────────────────────────────────────
  saveAndContinue(): void {
    const values = this.tempValues();
    const championship = this.championship();

    if (!this.isValid() || !values || !championship) return;

    this.loading.set(true);

    this.championshipSetupService
      .updatePeriodsAndTransferWindows(championship.id, values)
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/championships/setup', championship.id]);
        },
        error: (err: unknown) => {
          console.error('Erro ao salvar períodos', err);
          this.loading.set(false);
        },
      });
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
