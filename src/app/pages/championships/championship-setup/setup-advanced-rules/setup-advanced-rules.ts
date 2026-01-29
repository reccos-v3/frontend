import { Component, output, signal, effect, input } from '@angular/core';
import { IPostActivationRules } from '../../../../interfaces/setup-types.interface';
import { AppAlert } from '../../../../components/alert/alert';

@Component({
  selector: 'app-setup-advanced-rules',
  imports: [AppAlert],
  templateUrl: './setup-advanced-rules.html',
  styleUrl: './setup-advanced-rules.css',
})
export class SetupAdvancedRules {
  advancedRulesChange = output<IPostActivationRules>();
  embedded = input(false);

  allowTeamChanges = signal(false);
  allowScheduleChanges = signal(true);
  allowRuleChanges = signal(false);

  toggles = [
    {
      id: 'team',
      label: 'Permitir alteração de times',
      description: 'Gestores poderão editar elencos mesmo com a bola rolando em todas as fases.',
      value: this.allowTeamChanges,
      action: () => this.toggleTeamChanges(),
    },
    {
      id: 'schedule',
      label: 'Permitir remarcação de jogos',
      description: 'Flexibilidade total para alterar datas e horários dos jogos já sorteados.',
      value: this.allowScheduleChanges,
      action: () => this.toggleScheduleChanges(),
    },
    {
      id: 'rules',
      label: 'Permitir alteração de regras',
      description: 'Editar pontuação, critérios de desempate ou tempos de jogo durante a liga.',
      value: this.allowRuleChanges,
      action: () => this.toggleRuleChanges(),
    },
  ];

  constructor() {
    effect(() => {
      this.advancedRulesChange.emit({
        allowTeamChanges: this.allowTeamChanges(),
        allowScheduleChanges: this.allowScheduleChanges(),
        allowRuleChanges: this.allowRuleChanges(),
      });
    });
  }

  toggleTeamChanges() {
    this.allowTeamChanges.update((v) => !v);
  }

  toggleScheduleChanges() {
    this.allowScheduleChanges.update((v) => !v);
  }

  toggleRuleChanges() {
    this.allowRuleChanges.update((v) => !v);
  }
}
