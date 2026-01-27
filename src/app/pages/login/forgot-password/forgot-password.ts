import { Component, inject } from '@angular/core';
import { finalize, delay } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  resetForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm.valueChanges.subscribe((value) => {
      console.log('value', value);
    });

    this.resetForm.statusChanges.subscribe((status) => {
      console.log('status', status);
    });
  }

  onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      const email = this.resetForm.get('email')?.value;

      this.authService
        .forgotPassword(email)
        .pipe(
          delay(1500),
          finalize(() => (this.isLoading = false)),
        )
        .subscribe({
          next: () => {
            this.toastService.success(
              'Se o e-mail informado estiver em nossa base, você receberá um link para redefinição em instantes. Verifique também sua caixa de spam.',
            );
            this.resetForm.reset();
          },
          error: (error) => {
            this.toastService.error(
              'Erro ao enviar email de recuperação. Verifique se o email está correto.',
            );
            console.error('Error sending recovery email:', error);
          },
        });
    }
  }
}
