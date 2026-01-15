import { Component, signal, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IValidateResetTokenResponse } from '../../../interfaces/auth.interface';
import { ToastService } from '../../../services/toast.service';
import { delay, finalize } from 'rxjs';

interface PasswordStrength {
  level: number;
  isValid: boolean;
}

interface HeroMessage {
  title: string;
  description: string;
}

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  resetForm: FormGroup;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isSubmitting = signal(false);
  passwordStrength = signal<PasswordStrength>({ level: 0, isValid: false });
  passwordsMatch = signal(true);

  // Estado do token
  tokenStatus = signal<'validating' | 'valid' | 'invalid'>('validating');
  token = signal<string | null>(null);

  // Validação de requisitos
  hasMinLength = signal(false);
  hasUppercase = signal(false);
  hasNumberOrSymbol = signal(false);

  // Carrossel de mensagens
  currentSlide = signal(0);
  private carouselInterval?: number;

  heroMessages: HeroMessage[] = [
    {
      title: 'A vitória começa fora de campo.',
      description:
        'Gerencie ligas, times e estatísticas com a precisão de um campeão. O sistema definitivo para organizadores profissionais.',
    },
    {
      title: 'Controle total sobre seus torneios.',
      description:
        'Organize partidas, gerencie tabelas e acompanhe resultados em tempo real. Tudo que você precisa para criar campeonatos de sucesso.',
    },
    {
      title: 'Estatísticas que fazem a diferença.',
      description:
        'Analise desempenho de times, artilheiros e jogadores. Tome decisões estratégicas baseadas em dados precisos e confiáveis.',
    },
  ];

  private platformId = inject(PLATFORM_ID);

  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Verificar token na URL
    const token = this.route.snapshot.queryParamMap.get('token');
    console.log('token', token);

    if (token) {
      this.token.set(token);
      this.validateToken(token);
    } else {
      this.tokenStatus.set('invalid');
    }

    // Auto-play do carrossel a cada 5 segundos (apenas no browser)
    if (isPlatformBrowser(this.platformId)) {
      this.startCarousel();
    }
  }

  validateToken(token: string): void {
    this.tokenStatus.set('validating');

    this.authService.validatePasswordResetToken(token).subscribe({
      next: (response: IValidateResetTokenResponse) => {
        if (response.status === 'VALID') {
          this.tokenStatus.set('valid');
        } else {
          this.tokenStatus.set('invalid');
        }
      },
      error: () => {
        this.tokenStatus.set('invalid');
      },
    });
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  startCarousel(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carouselInterval = window.setInterval(() => {
        this.nextSlide();
      }, 5000);
    }
  }

  stopCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  nextSlide(): void {
    const next = (this.currentSlide() + 1) % this.heroMessages.length;
    this.currentSlide.set(next);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
    // Reinicia o auto-play quando o usuário interage manualmente
    if (isPlatformBrowser(this.platformId)) {
      this.stopCarousel();
      this.startCarousel();
    }
  }

  getCurrentMessage(): HeroMessage {
    return this.heroMessages[this.currentSlide()];
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
    if (this.isFormValid() && this.token()) {
      this.isSubmitting.set(true);
      const password = this.resetForm.get('password')?.value;
      const token = this.token()!;

      this.authService
        .resetPassword({ token, newPassword: password })
        .pipe(
          delay(1500), // Artificial delay for better UX
          finalize(() => this.isSubmitting.set(false))
        )
        .subscribe({
          next: () => {
            this.toastService.success('Senha redefinida com sucesso!');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            if (error.status === 400 || error.status === 404) {
              this.tokenStatus.set('invalid');
              this.toastService.error('O link de recuperação expirou ou é inválido.');
            } else {
              this.toastService.error('Erro ao redefinir a senha. Tente novamente.');
            }
          },
        });
    }
  }
}
