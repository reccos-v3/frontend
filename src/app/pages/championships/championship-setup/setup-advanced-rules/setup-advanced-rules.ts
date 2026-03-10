import { Component, output, signal, input, OnInit, inject } from '@angular/core';
import { IAdvancedSettingsRequest } from '../../../../interfaces/championship-setup.interface';
import { AppAlert } from '../../../../components/alert/alert';
import { ChampionshipSetupService } from '../../../../services/championship-setup.service';
import { ChampionshipStore } from '../../../../services/championship.store';
import { Router } from '@angular/router';
import { SetupFooterButtons } from '../setup-footer-buttons/setup-footer-buttons';

interface ActivationOption {
  id: 'MANUAL' | 'AUTOMATIC';
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-setup-advanced-rules',
  standalone: true,
  imports: [AppAlert, SetupFooterButtons],
  templateUrl: './setup-advanced-rules.html',
  styleUrl: './setup-advanced-rules.css',
})
export class SetupAdvancedRules implements OnInit {
  private championshipSetupService = inject(ChampionshipSetupService);
  private championshipStore = inject(ChampionshipStore);
  private router = inject(Router);

  advancedRulesChange = output<IAdvancedSettingsRequest>();
  embedded = input(false);
  initialData = input<IAdvancedSettingsRequest | null>(null);

  // Iniciar todos como false conforme solicitado
  allowRosterChanges = signal(false);
  allowScheduleChanges = signal(false);
  activationMode = signal<'MANUAL' | 'AUTOMATIC'>('MANUAL');

  isValid = signal(true);
  loading = signal(false);
  championship = this.championshipStore.championship;

  toggles = [
    {
      id: 'roster',
      label: 'Permitir Mudanças no Elenco',
      description:
        'Define se os times podem adicionar ou remover jogadores após o início do campeonato (Respeitando Janela de Transferência).',
      value: this.allowRosterChanges,
      action: () => this.toggleRosterChanges(),
    },
    {
      id: 'schedule',
      label: 'Permitir Mudanças na Tabela',
      description:
        'Controla se as datas e horários dos jogos podem ser alterados depois que o campeonato já começou.',
      value: this.allowScheduleChanges,
      action: () => this.toggleScheduleChanges(),
    },
  ];

  activationOptions: ActivationOption[] = [
    {
      id: 'MANUAL',
      title: 'Ativação Manual',
      description:
        'O organizador precisa clicar em um botão para iniciar o campeonato oficialmente.',
      icon: 'touch_app',
    },
    {
      id: 'AUTOMATIC',
      title: 'Ativação Automática',
      description:
        'O sistema inicia o campeonato sozinho assim que todas as etapas estiverem prontas.',
      icon: 'auto_mode',
    },
  ];

  ngOnInit(): void {
    const data = this.initialData();
    const settings = this.championship()?.settings;

    if (data) {
      this.allowRosterChanges.set(data.allowRosterChanges);
      this.allowScheduleChanges.set(data.allowScheduleChanges);
      this.activationMode.set(data.activationMode);
    } else if (settings) {
      this.allowRosterChanges.set(settings.allowRosterChanges);
      this.allowScheduleChanges.set(settings.allowScheduleChanges);
      this.activationMode.set(settings.activationMode);
    }
  }

  returnHub() {
    const championship = this.championship();
    if (!championship) return;

    this.router.navigate(['/admin/championships/setup', championship.id]);
  }

  saveAndContinue() {
    const currentChampionship = this.championship();
    if (!currentChampionship) return;

    const payload = {
      allowRosterChanges: this.allowRosterChanges(),
      allowScheduleChanges: this.allowScheduleChanges(),
      allowRuleChanges: false,
      activationMode: this.activationMode(),
    };

    this.loading.set(true);
    this.championshipSetupService.updateAdvancedRules(currentChampionship.id, payload).subscribe({
      next: (response) => {
        this.loading.set(false);
        const currentProgress = this.championship()?.progress;
        this.championshipStore.update({
          settings: {
            ...response,
          },
          progress: currentProgress ? { ...currentProgress, settings: true } : undefined,
        });
        this.router.navigate(['/admin/championships/setup', currentChampionship.id]);
      },
      error: (error) => {
        console.error('Erro ao salvar estrutura:', error);
        this.loading.set(false);
      },
    });
  }

  toggleRosterChanges() {
    this.allowRosterChanges.update((v) => !v);
  }

  toggleScheduleChanges() {
    this.allowScheduleChanges.update((v) => !v);
  }

  eventClickConfirmButton(event: 'saveAndContinue' | 'returnHub') {
    if (event === 'saveAndContinue') {
      this.saveAndContinue();
    } else {
      this.returnHub();
    }
  }
}
