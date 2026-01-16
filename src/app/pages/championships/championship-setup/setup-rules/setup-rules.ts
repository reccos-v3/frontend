import { Component, output } from '@angular/core';

@Component({
  selector: 'app-setup-rules',
  imports: [],
  templateUrl: './setup-rules.html',
  styleUrl: './setup-rules.css',
})
export class SetupRules {
  advanced = output<'rules' | 'format'>();

  saveAndContinue() {
    console.log('SetupRules: saveAndContinue clicked, emitting format');
    this.advanced.emit('format');
  }
}
