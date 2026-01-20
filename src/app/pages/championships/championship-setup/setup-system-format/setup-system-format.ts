import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-setup-system-format',
  standalone: true,
  imports: [],
  templateUrl: './setup-system-format.html',
  styleUrl: './setup-system-format.css',
})
export class SetupSystemFormat {
  format = input<string>('groups_knockout');

  groupsCount = input.required<number>();
  qualifiedPerGroup = input.required<number>();
  totalTeams = input.required<number>();

  updateGroupsCount = output<number>();
  updateQualified = output<number>();
  updateTotalTeams = output<number>();

  changeGroupsCount(val: number) {
    this.updateGroupsCount.emit(val);
  }

  changeQualified(val: number) {
    this.updateQualified.emit(val);
  }

  changeTotalTeams(val: number) {
    this.updateTotalTeams.emit(val);
  }
}
