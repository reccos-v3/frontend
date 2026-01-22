import { Component, inject, input, output, signal } from '@angular/core';
import { SetupStep, IChampionshipSetupRequest } from '../setup-types';
import { ChampionshipService } from '../../../../services/championship.service';
import { ToastService } from '../../../../services/toast.service';
import { Router } from '@angular/router';
import { AppAlert } from '../../../../components/alert/alert';
import { ModalSetupFinish } from '../../../../components/modal-setup-finish/modal-setup-finish';

@Component({
  selector: 'app-setup-final-review',
  standalone: true,
  imports: [AppAlert, ModalSetupFinish],
  templateUrl: './setup-final-review.html',
  styleUrl: './setup-final-review.css',
})
export class SetupFinalReview {
  private championshipService = inject(ChampionshipService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  data = input.required<IChampionshipSetupRequest>();
  advanced = output<SetupStep>();

  isModalOpen = signal(false);

  openConfirmation() {
    this.isModalOpen.set(true);
  }

  handleConfirm() {
    console.log('Campeonato Ativado!');
    this.isModalOpen.set(false);
    // Sua lógica de ativação aqui
  }

  confirmAndFinish() {
    console.log('Championship setup finalized!', this.data());

    this.championshipService.createChampionship(this.data() as any).subscribe({
      next: (res) => {
        this.toastService.success('Campeonato criado com sucesso!');
        this.router.navigate(['/championships']);
      },
      error: (err) => {
        this.toastService.error('Erro ao criar campeonato. Verifique os dados.');
        console.error(err);
      },
    });
  }

  returnToPrevious() {
    this.advanced.emit('teams');
  }
}
