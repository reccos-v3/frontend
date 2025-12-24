import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PasswordStrength {
  level: number;
  isValid: boolean;
}

@Component({
  selector: 'app-enable-access',
  imports: [CommonModule, FormsModule],
  templateUrl: './enable-access.html',
  styleUrl: './enable-access.css',
})
export class EnableAccess {
  protected verificationCode = signal('FPF-2024-GL');
  protected password = signal('');
  protected confirmPassword = signal('');
  protected showPassword = signal(false);
  protected showConfirmPassword = signal(false);
  protected passwordStrength = signal<PasswordStrength>({ level: 0, isValid: false });
  protected passwordsMatch = signal(true);

  protected togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((val) => !val);
  }

  protected onPasswordChange(value: string): void {
    this.password.set(value);
    this.calculatePasswordStrength(value);
    this.checkPasswordsMatch();
  }

  protected onConfirmPasswordChange(value: string): void {
    this.confirmPassword.set(value);
    this.checkPasswordsMatch();
  }

  private calculatePasswordStrength(password: string): void {
    let level = 0;

    if (password.length >= 8) level++;
    if (password.length >= 12) level++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) level++;
    if (/\d/.test(password)) level++;
    if (/[^a-zA-Z0-9]/.test(password)) level++;

    const isValid = password.length >= 8;

    this.passwordStrength.set({ level, isValid });
  }

  private checkPasswordsMatch(): void {
    const match = this.password() === this.confirmPassword() || this.confirmPassword() === '';
    this.passwordsMatch.set(match);
  }

  protected onSubmit(): void {
    if (this.passwordStrength().isValid && this.passwordsMatch()) {
      console.log('Form submitted', {
        verificationCode: this.verificationCode(),
        password: this.password(),
      });
      // Handle form submission
    }
  }

  protected isFormValid(): boolean {
    return (
      this.verificationCode().length > 0 &&
      this.passwordStrength().isValid &&
      this.passwordsMatch() &&
      this.confirmPassword().length > 0
    );
  }
}
