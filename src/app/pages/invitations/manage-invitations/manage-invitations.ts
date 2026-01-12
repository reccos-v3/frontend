import { Component, inject, OnInit } from '@angular/core';
import { RolesService } from '../../../services/roles.service';
import { IRole } from '../../../components/interfaces/roles.interface';
import { InvitationService } from '../../../services/invitation.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ISendInvitationResponse } from '../../../components/interfaces/invitation.interface';

@Component({
  selector: 'app-manage-invitations',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './manage-invitations.html',
  styleUrl: './manage-invitations.css',
})
export class ManageInvitations implements OnInit {
  private fb = inject(FormBuilder);
  private rolesService = inject(RolesService);
  private invitationService = inject(InvitationService);

  invitationUserForm!: FormGroup;
  roles: IRole[] = [];
  ngOnInit(): void {
    this.invitationUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
    });
    this.getRoles();
  }

  getRoles() {
    this.rolesService.getAllRoles().subscribe({
      next: (roles: IRole[]) => {
        this.roles = roles;
        console.log(this.roles);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  sendInvitation() {
    this.invitationService.sendInvitation({ ...this.invitationUserForm.value }).subscribe({
      next: (response: ISendInvitationResponse) => {
        console.log(response);
        this.invitationUserForm.reset();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
