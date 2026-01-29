import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-setup-points',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup-points.html',
})
export class SetupPointsComponent {
  form = input.required<FormGroup>();
  embedded = input(false);
}
