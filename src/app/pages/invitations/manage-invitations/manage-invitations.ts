import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../../services/invitation.service';
import { IInvitation } from '../../../interfaces/invitation.interface';
import { IPage } from '../../../interfaces/page.interface';
import { ITableColumn, ITableAction, ITablePagination } from '../../../interfaces/table.interface';
import { TableList } from '../../../components/table-list/table-list';
import { SendInvitations } from '../send-invitations/send-invitations';

@Component({
  selector: 'app-manage-invitations',
  imports: [CommonModule, SendInvitations, TableList],
  templateUrl: './manage-invitations.html',
  styleUrl: './manage-invitations.css',
})
export class ManageInvitations implements OnInit {
  private invitationService = inject(InvitationService);

  page = signal<number>(0);
  size = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  invitations = signal<IInvitation[]>([]);
  isLoading = signal<boolean>(false);

  // Configuração das colunas da tabela
  columns = signal<ITableColumn<IInvitation>[]>([
    {
      key: 'email',
      label: 'Email',
      width: '30%',
      render: (row) => this.renderEmailCell(row),
    },
    {
      key: 'roleName',
      label: 'Papel',
      width: '15%',
      render: (row) => this.renderRoleCell(row),
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (row) => this.renderStatusCell(row),
    },
    {
      key: 'createdAt',
      label: 'Data de Envio',
      width: '15%',
      render: (row) => this.formatDate(row.createdAt),
    },
    {
      key: 'expiresAt',
      label: 'Expiração',
      width: '15%',
      render: (row) => this.renderExpirationCell(row),
    },
  ]);

  // Configuração das ações da tabela
  actions = signal<ITableAction<IInvitation>[]>([
    {
      icon: 'refresh',
      label: 'Reenviar',
      variant: 'primary',
      action: (row) => this.resendInvitation(row),
      show: (row) => row.status === 'PENDING' || row.status === 'EXPIRED',
    },
    {
      icon: 'block',
      label: 'Revogar',
      variant: 'danger',
      action: (row) => this.revokeInvitation(row),
      show: (row) => row.status === 'ACTIVE',
    },
    {
      icon: 'delete',
      label: 'Cancelar',
      variant: 'danger',
      action: (row) => this.cancelInvitation(row),
      show: (row) => row.status === 'PENDING',
    },
  ]);

  ngOnInit(): void {
    this.getInvitations();
  }

  getInvitations() {
    this.isLoading.set(true);
    this.invitationService.getInvitations(this.page(), this.size()).subscribe({
      next: (response: IPage<IInvitation>) => {
        this.invitations.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.log(error);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.getInvitations();
  }

  // Métodos de renderização customizada
  renderEmailCell(row: IInvitation): string {
    const shortId = row.id.substring(0, 8).toUpperCase();
    return `
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-secondary">${row.email}</span>
        <span class="text-[10px] text-slate-400">ID: ${shortId}</span>
      </div>
    `;
  }

  renderRoleCell(row: IInvitation): string {
    const roleColors: Record<string, string> = {
      FEDERATION_OWNER: 'bg-blue-50 text-blue-700 border-blue-100',
      FEDERATION_ADMIN: 'bg-purple-50 text-purple-700 border-purple-100',
      ORGANIZER: 'bg-green-50 text-green-700 border-green-100',
      REFEREE: 'bg-orange-50 text-orange-700 border-orange-100',
      USER: 'bg-slate-100 text-slate-700 border-slate-200',
    };

    const colors = roleColors[row.roleName] || 'bg-slate-100 text-slate-700 border-slate-200';
    return `
      <span class="text-xs font-medium px-2 py-1 ${colors} border rounded">
        ${row.roleName}
      </span>
    `;
  }

  renderStatusCell(row: IInvitation): string {
    const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
      PENDING: { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Pendente' },
      ACTIVE: { color: 'text-primary', bg: 'bg-primary', label: 'Ativo' },
      EXPIRED: { color: 'text-red-600', bg: 'bg-red-500', label: 'Expirado' },
      USED: { color: 'text-green-600', bg: 'bg-green-500', label: 'Usado' },
    };

    const config = statusConfig[row.status] || statusConfig['PENDING'];
    return `
      <div class="flex items-center gap-1.5">
        <span class="size-2 rounded-full ${config.bg}"></span>
        <span class="text-xs font-bold ${config.color}">${config.label}</span>
      </div>
    `;
  }

  renderExpirationCell(row: IInvitation): string {
    if (!row.expiresAt) {
      return '<span class="text-sm text-slate-600">-</span>';
    }

    const isExpired = row.status === 'EXPIRED';
    const classes = isExpired ? 'text-sm text-red-500 font-semibold' : 'text-sm text-slate-600';

    return `<span class="${classes}">${this.formatDate(row.expiresAt)}</span>`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  // Métodos de ação
  resendInvitation(row: IInvitation): void {
    console.log('Reenviar convite:', row);
    // TODO: Implementar lógica de reenvio
  }

  revokeInvitation(row: IInvitation): void {
    console.log('Revogar convite:', row);
    // TODO: Implementar lógica de revogação
  }

  cancelInvitation(row: IInvitation): void {
    console.log('Cancelar convite:', row);
    // TODO: Implementar lógica de cancelamento
  }

  // Getter para paginação
  get pagination(): ITablePagination {
    return {
      currentPage: this.page(),
      pageSize: this.size(),
      totalElements: this.totalElements(),
      totalPages: this.totalPages(),
      onPageChange: (page: number) => this.onPageChange(page),
    };
  }

  // Handler para ações da tabela
  handleAction(event: { action: ITableAction<IInvitation>; row: IInvitation }): void {
    // A ação já é executada pelo componente, este método é apenas para logging se necessário
    console.log('Ação executada:', event.action.label, event.row);
  }
}
