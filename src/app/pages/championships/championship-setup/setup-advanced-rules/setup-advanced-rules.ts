import { Component, output, signal, input, OnInit } from '@angular/core';
import { IAdvancedSettingsRequest } from '../../../../interfaces/championship-setup.interface';
import { AppAlert } from '../../../../components/alert/alert';

interface ActivationOption {
  id: 'MANUAL' | 'AUTOMATIC';
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-setup-advanced-rules',
  standalone: true,
  imports: [AppAlert],
  templateUrl: './setup-advanced-rules.html',
  styleUrl: './setup-advanced-rules.css',
})
export class SetupAdvancedRules implements OnInit {
  advancedRulesChange = output<IAdvancedSettingsRequest>();
  embedded = input(false);
  initialData = input<IAdvancedSettingsRequest | null>(null);

  // Iniciar todos como false conforme solicitado
  allowRosterChanges = signal(false);
  allowScheduleChanges = signal(false);
  activationMode = signal<'MANUAL' | 'AUTOMATIC'>('MANUAL');

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
    if (data) {
      this.allowRosterChanges.set(data.allowRosterChanges);
      this.allowScheduleChanges.set(data.allowScheduleChanges);
      this.activationMode.set(data.activationMode);
    }
  }

  // Método explícito para enviar as informações apenas quando solicitado
  submit() {
    this.advancedRulesChange.emit({
      allowRosterChanges: this.allowRosterChanges(),
      allowScheduleChanges: this.allowScheduleChanges(),
      allowRuleChanges: false,
      activationMode: this.activationMode(),
    });
  }

  toggleRosterChanges() {
    this.allowRosterChanges.update((v) => !v);
  }

  toggleScheduleChanges() {
    this.allowScheduleChanges.update((v) => !v);
  }
}
