import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PasswordStrength {
  level: number;
  isValid: boolean;
}

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  resetForm: FormGroup;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordStrength = signal<PasswordStrength>({ level: 0, isValid: false });
  passwordsMatch = signal(true);

  // Validação de requisitos
  hasMinLength = signal(false);
  hasUppercase = signal(false);
  hasNumberOrSymbol = signal(false);

  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((val) => !val);
  }

  onPasswordChange(value: string): void {
    this.calculatePasswordStrength(value);
    this.checkPasswordsMatch();
  }

  onConfirmPasswordChange(value: string): void {
    this.checkPasswordsMatch();
  }

  private calculatePasswordStrength(password: string): void {
    // Verificar requisitos individuais
    const minLength = password.length >= 8;
    const uppercase = /[A-Z]/.test(password);
    const numberOrSymbol = /[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password);

    this.hasMinLength.set(minLength);
    this.hasUppercase.set(uppercase);
    this.hasNumberOrSymbol.set(numberOrSymbol);

    // Calcular nível de força (0-4) para corresponder aos 4 segmentos da barra
    let level = 0;
    if (minLength) level++; // 1 segmento
    if (password.length >= 10) level++; // 2 segmentos
    if (uppercase && /[a-z]/.test(password)) level++; // 3 segmentos
    if (numberOrSymbol) level++; // 4 segmentos

    const isValid = minLength && uppercase && numberOrSymbol;

    this.passwordStrength.set({ level, isValid });
  }

  private checkPasswordsMatch(): void {
    const password = this.resetForm.get('password')?.value || '';
    const confirmPassword = this.resetForm.get('confirmPassword')?.value || '';
    const match = password === confirmPassword && confirmPassword !== '';
    this.passwordsMatch.set(match);
  }

  getPasswordStrengthText(): string {
    const level = this.passwordStrength().level;
    if (level === 0) return 'Muito fraca';
    if (level === 1) return 'Fraca';
    if (level === 2) return 'Média';
    if (level === 3) return 'Forte';
    if (level === 4) return 'Muito forte';
    return 'Muito fraca';
  }

  isFormValid(): boolean {
    return (
      this.resetForm.valid &&
      this.passwordStrength().isValid &&
      this.passwordsMatch() &&
      this.resetForm.get('confirmPassword')?.value !== ''
    );
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      console.log('Form submitted:', {
        password: this.resetForm.get('password')?.value,
      });
      // Handle password reset logic here
    }
  }
}
