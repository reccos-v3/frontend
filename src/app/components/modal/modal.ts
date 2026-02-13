import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class AppModal {
  isOpen = input.required<boolean>();
  title = input<string>('Modal');
  icon = input<string>();
  maxWidth = input<string>('max-w-2xl');
  closeOnBackdrop = input<boolean>(true);

  modalClose = output<void>();

  protected readonly titleId = 'modal-title-' + Math.random().toString(36).substring(2, 9);

  onBackdropClick() {
    if (this.closeOnBackdrop()) {
      this.modalClose.emit();
    }
  }
}
