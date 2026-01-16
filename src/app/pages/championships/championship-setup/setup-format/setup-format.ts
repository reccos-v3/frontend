import { Component, output } from '@angular/core';
import { SetupKnockoutGroup } from '../setup-knockout-group/setup-knockout-group';
import { SetupSidebarFormat } from '../setup-sidebar-format/setup-sidebar-format';
import { SetupSystemFormat } from '../setup-system-format/setup-system-format';

@Component({
  selector: 'app-setup-format',
  imports: [SetupKnockoutGroup, SetupSidebarFormat, SetupSystemFormat],
  templateUrl: './setup-format.html',
  styleUrl: './setup-format.css',
})
export class SetupFormat {
  advanced = output<'rules' | 'format' | 'teams'>();

  selectedFormat = 'groups_knockout';

  formats = [
    {
      id: 'groups_knockout',
      icon: 'grid_view',
      label: 'Grupos + Mata-mata',
      description: 'Copa do Mundo',
    },
    {
      id: 'knockout',
      icon: 'trophy',
      label: 'Mata-mata Direto',
      description: 'Copa do Brasil',
    },
    {
      id: 'round_robin',
      icon: 'leaderboard',
      label: 'Pontos Corridos',
      description: 'Brasileirão',
    },
  ];

  saveAndContinue() {
    console.log('saveAndContinue');
    this.advanced.emit('teams');
  }

  returnToPrevious() {
    this.advanced.emit('rules');
  }
}
