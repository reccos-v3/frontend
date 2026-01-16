import { Component } from '@angular/core';

@Component({
  selector: 'app-setup-sidebar-format',
  imports: [],
  templateUrl: './setup-sidebar-format.html',
  styleUrl: './setup-sidebar-format.css',
})
export class SetupSidebarFormat {
  selectedFormat: 'round_robin' | 'knockout' | 'league' = 'round_robin';
}
