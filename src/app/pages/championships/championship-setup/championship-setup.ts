import { Component, output, signal } from '@angular/core';
import { SetupHeader } from './setup-header/setup-header';
import { SetupSidebar } from './setup-sidebar/setup-sidebar';
import { SetupRules } from './setup-rules/setup-rules';
import { SetupFormat } from './setup-format/setup-format';

@Component({
  selector: 'app-championship-setup',
  imports: [SetupHeader, SetupSidebar, SetupRules, SetupFormat],
  templateUrl: './championship-setup.html',
  styleUrl: './championship-setup.css',
})
export class ChampionshipSetup {
  activeComponent = signal<'rules' | 'format'>('rules');

  advanced(component: 'rules' | 'format') {
    console.log('advanced', component);
    this.activeComponent.set(component);
  }
}
