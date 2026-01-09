import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-auth-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth-login.html',
  styleUrl: './auth-login.css',
})
export class AuthLogin {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Verifica se já está autenticado ao carregar o componente
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        // Login bem-sucedido, redireciona para o dashboard
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.isLoading = false;
        // Trata erros de autenticação
        if (error.status === 401) {
          this.errorMessage = 'E-mail ou senha inválidos. Verifique suas credenciais.';
        } else if (error.status === 0) {
          this.errorMessage = 'Erro de conexão. Verifique se o servidor está em execução.';
        } else {
          this.errorMessage = 'Erro ao realizar login. Tente novamente mais tarde.';
        }
      },
    });
  }
}
