import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-refresh-token',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './refresh-token.html',
  styleUrl: './refresh-token.css',
})
export class RefreshToken {
  resetForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.resetForm.valid) {
      console.log('Form submitted:', this.resetForm.value);
      // Handle password reset logic here
    }
  }
}

