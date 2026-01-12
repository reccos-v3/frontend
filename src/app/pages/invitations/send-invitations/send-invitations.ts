import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IRole } from '../../../components/interfaces/roles.interface';
import { RolesService } from '../../../services/roles.service';
import { InvitationService } from '../../../services/invitation.service';
import { ToastService } from '../../../services/toast.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ISendInvitationResponse } from '../../../components/interfaces/invitation.interface';
import { ErrorHandlerUtil } from '../../../utils/error-handler.util';

@Component({
  selector: 'app-send-invitations',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './send-invitations.html',
  styleUrl: './send-invitations.css',
})
export class SendInvitations implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private rolesService = inject(RolesService);
  private invitationService = inject(InvitationService);
  private toastService = inject(ToastService);

  invitationUserForm!: FormGroup;
  roles = signal<IRole[]>([]);
  isLoadingRoles = signal<boolean>(true);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.invitationUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      roleId: [2, [Validators.required]],
    });

    const resolvedRoles = this.route.snapshot.data['roles'] as IRole[] | undefined;

    if (resolvedRoles && Array.isArray(resolvedRoles) && resolvedRoles.length > 0) {
      this.roles.set(resolvedRoles);
      this.isLoadingRoles.set(false);
    } else {
      const cachedRoles = this.rolesService.getRolesFromCache();
      if (cachedRoles && cachedRoles.length > 0) {
        this.roles.set(cachedRoles);
        this.isLoadingRoles.set(false);
      } else {
        this.loadRoles();
      }
    }
  }

  private loadRoles(): void {
    this.rolesService.getCachedRoles().subscribe({
      next: (roles: IRole[]) => {
        this.roles.set(roles || []);
        setTimeout(() => {
          this.isLoadingRoles.set(false);
        }, 1000);
      },
      error: (error) => {
        console.error('Erro ao carregar roles:', error);
        this.roles.set([]);
        this.isLoadingRoles.set(false);
      },
    });
  }

  sendInvitation() {
    if (this.invitationUserForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    this.invitationService.sendInvitation({ ...this.invitationUserForm.value }).subscribe({
      next: (response: ISendInvitationResponse) => {
        this.isLoading.set(false);
        this.toastService.success('Convite enviado com sucesso!');
        this.invitationUserForm.reset();
        // Resetar o role para o valor padrão após reset
        this.invitationUserForm.patchValue({ role: 2 });
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.handleApiError(error);
      },
    });
  }

  /**
   * Trata erros de validação da API e exibe no toast
   */
  private handleApiError(error: HttpErrorResponse): void {
    try {
      const apiError = error.error;

      const errorMessages: string[] = [];

      // Adiciona a mensagem principal se existir
      if (apiError?.message) {
        errorMessages.push(apiError.message);
      }

      // Adiciona todos os erros de campo se existirem
      if (apiError?.errors && typeof apiError.errors === 'object') {
        const errorKeys = Object.keys(apiError.errors);
        if (errorKeys.length > 0) {
          const fieldErrors = Object.values(apiError.errors) as string[];
          errorMessages.push(...fieldErrors);
        }
      }

      // Combina todas as mensagens
      const finalMessage =
        errorMessages.length > 0
          ? errorMessages.join('; ')
          : 'Erro ao enviar convite. Tente novamente.';

      // Exibe o toast com todas as mensagens
      this.toastService.error(finalMessage);
    } catch (err) {
      console.error('Erro ao processar erro da API:', err);
      // Se não conseguir parsear o erro, exibe mensagem padrão
      this.toastService.error('Erro ao enviar convite. Tente novamente.');
    }
  }
}
