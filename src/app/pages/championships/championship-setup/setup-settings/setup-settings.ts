import { Component, signal } from '@angular/core';
import { ChampionshipCreate } from '../../championship-create/championship-create';
import { IChampionshipResponse } from '../../../../interfaces/championship.interface';
import { SetupPeriods } from '../setup-periods/setup-periods';
import { SetupFormat } from '../setup-format/setup-format';
import { SetupRules } from '../setup-rules/setup-rules';
import { SetupAddTeams } from '../setup-add-teams/setup-add-teams';
@Component({
  selector: 'app-setup-settings',
  imports: [ChampionshipCreate, SetupPeriods, SetupFormat, SetupRules, SetupAddTeams],
  templateUrl: './setup-settings.html',
  styleUrl: './setup-settings.css',
})
export class SetupSettings {
  activeComponent = signal<string>('rules');
  data = signal<IChampionshipResponse>({} as IChampionshipResponse);
  constructor() {
    const navigation = window.history.state;
    console.log('navigation', navigation);
    this.data.set(navigation.payload);
    this.activeComponent.set(navigation.id);
  }
}
