import { Component, inject, input, output } from '@angular/core';
import { SetupStep, IChampionshipSetupRequest } from '../setup-types';
import { ChampionshipService } from '../../../../services/championship.service';
import { ToastService } from '../../../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup-final-review',
  standalone: true,
  imports: [],
  templateUrl: './setup-final-review.html',
  styleUrl: './setup-final-review.css',
})
export class SetupFinalReview {
  private championshipService = inject(ChampionshipService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  data = input.required<IChampionshipSetupRequest>();
  advanced = output<SetupStep>();

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
