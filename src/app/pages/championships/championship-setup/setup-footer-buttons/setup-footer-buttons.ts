import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-setup-footer-buttons',
  standalone: true,
  imports: [],
  templateUrl: './setup-footer-buttons.html',
  styleUrl: './setup-footer-buttons.css',
})
export class SetupFooterButtons {
  isValid = input<boolean>();
  eventClickConfirmButton = output<'saveAndContinue' | 'returnHub'>();
}
