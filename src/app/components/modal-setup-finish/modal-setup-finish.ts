import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-setup-finish',
  imports: [],
  templateUrl: './modal-setup-finish.html',
  styleUrl: './modal-setup-finish.css',
})
export class ModalSetupFinish {
  isOpen = input.required<boolean>();
  leagueName = input<string>('Campeonato');

  close = output<void>();
  confirm = output<void>();
}
