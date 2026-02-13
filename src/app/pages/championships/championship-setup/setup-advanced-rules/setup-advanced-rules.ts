import { Component, output, signal, input, OnInit } from '@angular/core';
import { IAdvancedSettingsRequest } from '../../../../interfaces/championship-setup.interface';
import { AppAlert } from '../../../../components/alert/alert';

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
  allowRuleChanges = signal(false);
  activationMode = signal<'MANUAL' | 'AUTOMATIC'>('MANUAL');

  toggles = [
    {
      id: 'roster',
      label: 'Janela de Transferência & Elencos',
      description:
        'Permite que gestores adicionem atletas e realizem trocas após o início do torneio.',
      value: this.allowRosterChanges,
      action: () => this.toggleRosterChanges(),
    },
    {
      id: 'schedule',
      label: 'Flexibilidade de Calendário',
      description:
        'Habilita a remarcação de partidas e alteração de horários com a competição em curso.',
      value: this.allowScheduleChanges,
      action: () => this.toggleScheduleChanges(),
    },
    {
      id: 'rules',
      label: 'Edição de Regulamento',
      description:
        'Permite ajustar critérios de desempate e configurações de pontuação durante a liga.',
      value: this.allowRuleChanges,
      action: () => this.toggleRuleChanges(),
    },
  ];

  ngOnInit(): void {
    const data = this.initialData();
    if (data) {
      this.allowRosterChanges.set(data.allowRosterChanges);
      this.allowScheduleChanges.set(data.allowScheduleChanges);
      this.allowRuleChanges.set(data.allowRuleChanges);
      this.activationMode.set(data.activationMode);
    }
  }

  // Método explícito para enviar as informações apenas quando solicitado
  submit() {
    this.advancedRulesChange.emit({
      allowRosterChanges: this.allowRosterChanges(),
      allowScheduleChanges: this.allowScheduleChanges(),
      allowRuleChanges: this.allowRuleChanges(),
      activationMode: this.activationMode(),
    });
  }

  toggleRosterChanges() {
    this.allowRosterChanges.update((v) => !v);
  }

  toggleScheduleChanges() {
    this.allowScheduleChanges.update((v) => !v);
  }

  toggleRuleChanges() {
    this.allowRuleChanges.update((v) => !v);
  }
}
