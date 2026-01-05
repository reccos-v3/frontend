import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '../../../services/invitation.service';
import { IValidateInvitationResponse } from '../../../interfaces/invitation.interface';
import { IApiError } from '../../../interfaces/error.interface';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface PasswordStrength {
  level: number;
  isValid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

@Component({
  selector: 'app-enable-access',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './enable-access.html',
  styleUrl: './enable-access.css',
})
export class EnableAccess implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invitationService = inject(InvitationService);
  private fb = inject(FormBuilder);

  // Token da URL
  protected token = signal<string>('');

  private readonly CODE_LENGTH = 11; // Tamanho esperado: 5qB-G59J-Aw

  // Form Group
  protected activationForm = this.fb.nonNullable.group(
    {
      verificationCode: [
        '',
        [
          Validators.required,
          Validators.minLength(this.CODE_LENGTH),
          Validators.maxLength(this.CODE_LENGTH),
        ],
      ],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      documentValue: ['', [Validators.required, this.cpfValidator()]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), this.passwordRequirementsValidator()],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [this.passwordMatchValidator()],
    }
  );

  // Strength UI state derived from form value
  private passwordValue = toSignal(this.activationForm.get('password')!.valueChanges, {
    initialValue: '',
  });

  protected passwordStrength = computed<PasswordStrength>(() => {
    return this.calculatePasswordStrength(this.passwordValue() || '');
  });

  // State signals
  protected isValidating = signal(false);
  protected isValidated = signal(false);
  protected isValid = signal(false);
  protected validationError = signal('');
  protected isSubmitting = signal(false);
  protected submitError = signal('');
  protected showPassword = signal(false);
  protected showConfirmPassword = signal(false);

  // Data signals
  protected validationData = signal<IValidateInvitationResponse | null>(null);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    this.token.set(token || '');

    // Monitora mudanças no código de verificação para disparar validação automática
    this.activationForm.get('verificationCode')?.valueChanges.subscribe((value) => {
      this.onVerificationCodeChange(value);
    });
  }

  // Helper patterns
  protected federationName = computed(() => this.validationData()?.federationName || '---');
  protected roleName = computed(() => this.validationData()?.roleName || '---');

  protected fieldsDisabled = computed(() => !this.isValid() || this.isSubmitting());

  protected onVerificationCodeChange(value: string): void {
    // Se tiver exatamente 11 caracteres, dispara blur automaticamente
    if (value.length === this.CODE_LENGTH) {
      this.validateCode(value);
    } else {
      this.validationError.set('');
      this.isValidated.set(false);
      this.isValid.set(false);
    }
  }

  protected validateCode(code: string): void {
    if (this.isValidating()) return;

    this.isValidating.set(true);
    this.validationError.set('');

    this.invitationService.validateCode(this.token(), code).subscribe({
      next: (response) => {
        this.isValidating.set(false);
        this.isValidated.set(true);
        this.isValid.set(response.valid);
        this.validationData.set(response);

        if (response.valid) {
          this.activationForm.get('email')?.setValue(response.email);
          this.validationError.set('');
        } else {
          this.validationError.set('Token ou código inválido');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isValidating.set(false);
        this.isValidated.set(true);
        this.isValid.set(false);
        this.validationError.set(this.extractErrorMessage(error));
      },
    });
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      if (!password || !confirmPassword) return null;

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  private cpfValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.replace(/[^\d]+/g, '');
      if (!value) return null;

      if (value.length !== 11 || !!value.match(/(\d)\1{10}/)) return { cpfInvalid: true };

      const values = value.split('').map((el: string) => +el);
      const rest = (count: number) =>
        ((values
          .slice(0, count - 12)
          .reduce((s: number, el: number, i: number) => s + el * (count - i), 0) *
          10) %
          11) %
        10;

      return rest(10) === values[9] && rest(11) === values[10] ? null : { cpfInvalid: true };
    };
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  private passwordRequirementsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasMinLength = value.length >= 8;

      const valid = hasUpperCase && hasNumber && hasSpecial && hasMinLength;

      return !valid ? { passwordRequirements: true } : null;
    };
  }

  private calculatePasswordStrength(password: string): PasswordStrength {
    if (!password) {
      return {
        level: 0,
        isValid: false,
        hasMinLength: false,
        hasUpperCase: false,
        hasNumber: false,
        hasSpecial: false,
      };
    }

    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let level = 0;
    if (hasMinLength) level++;
    if (hasUpperCase) level++;
    if (hasNumber) level++;
    if (hasSpecial) level++;

    const isValid = level >= 4 && hasMinLength;

    return {
      level,
      isValid,
      hasMinLength,
      hasUpperCase,
      hasNumber,
      hasSpecial,
    };
  }

  protected onSubmit(): void {
    if (this.activationForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.submitError.set('');

    const formValue = this.activationForm.getRawValue();
    const request = {
      invitationToken: this.token(),
      fullName: formValue.fullName,
      documentType: 'CPF',
      documentValue: formValue.documentValue,
      password: formValue.password,
    };

    this.invitationService.activate(request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/login'], {
          queryParams: { activated: 'true' },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.submitError.set(this.extractErrorMessage(error));
      },
    });
  }

  /**
   * Extrai a mensagem de erro do formato da API
   * Prioriza mensagens específicas do campo "code", depois a mensagem geral
   */
  private extractErrorMessage(error: HttpErrorResponse): string {
    try {
      const apiError = error.error as IApiError;

      // Se houver erros específicos do campo "code", usa essa mensagem
      if (apiError.errors && apiError.errors['code']) {
        return apiError.errors['code'];
      }

      // Se houver uma mensagem geral, usa ela
      if (apiError.message) {
        return apiError.message;
      }

      // Fallback para mensagem padrão
      return 'Token ou código inválido';
    } catch {
      // Se não conseguir parsear o erro, retorna mensagem padrão
      return 'Token ou código inválido';
    }
  }
}
