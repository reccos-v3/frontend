import { Component, output, signal } from '@angular/core';
import { SetupHeader } from './setup-header/setup-header';
import { SetupSidebar } from './setup-sidebar/setup-sidebar';
import { SetupRules } from './setup-rules/setup-rules';
import { SetupFormat } from './setup-format/setup-format';
import { SetupAddTeams } from './setup-add-teams/setup-add-teams';

@Component({
  selector: 'app-championship-setup',
  imports: [SetupHeader, SetupSidebar, SetupRules, SetupFormat, SetupAddTeams],
  templateUrl: './championship-setup.html',
  styleUrl: './championship-setup.css',
})
export class ChampionshipSetup {
  activeComponent = signal<'rules' | 'format' | 'teams'>('rules');

  advanced(component: 'rules' | 'format' | 'teams') {
    this.activeComponent.set(component);
  }
}
