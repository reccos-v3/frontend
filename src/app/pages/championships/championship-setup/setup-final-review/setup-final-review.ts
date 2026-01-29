import { Component, effect, inject, input, output, signal } from '@angular/core';
import { SetupStep, IChampionshipSetupRequest } from '../../../../interfaces/setup-types.interface';
import { ChampionshipService } from '../../../../services/championship.service';
import { ToastService } from '../../../../services/toast.service';
import { Router } from '@angular/router';
import { ModalSetupFinish } from '../../../../components/modal-setup-finish/modal-setup-finish';

@Component({
  selector: 'app-setup-final-review',
  standalone: true,
  imports: [ModalSetupFinish],
  templateUrl: './setup-final-review.html',
  styleUrl: './setup-final-review.css',
})
export class SetupFinalReview {
  private championshipService = inject(ChampionshipService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  data = input.required<IChampionshipSetupRequest>();
  advanced = output<SetupStep>();
  dataUpdate = output<Partial<IChampionshipSetupRequest>>();
  finalReview = output();
  isModalOpen = signal(false);

  // Activation Policy
  activationMode = signal<'MANUAL' | 'AUTOMATIC'>('MANUAL');
  autoActivateAt = signal<string | null>(null);

  constructor() {
    // Restaurar política de ativação
    effect(
      () => {
        const initial = this.data();
        if (initial?.activationPolicy) {
          this.activationMode.set(initial.activationPolicy.mode);
          this.autoActivateAt.set(initial.activationPolicy.autoActivateAt);
        }
      },
      { allowSignalWrites: true },
    );

    // Emitir atualizações reativas
    effect(() => {
      const mode = this.activationMode();
      const autoActivateAt = this.autoActivateAt();

      this.dataUpdate.emit({
        activationPolicy: {
          mode,
          autoActivateAt,
        },
      });
    });
  }

  setActivationMode(mode: 'MANUAL' | 'AUTOMATIC') {
    this.activationMode.set(mode);
    if (mode === 'MANUAL') {
      this.autoActivateAt.set(null);
    }
  }

  onAutoActivateChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.autoActivateAt.set(value || null);
  }

  openConfirmation() {
    this.isModalOpen.set(true);
  }

  handleConfirm() {
    console.log('Campeonato Ativado!');
    this.isModalOpen.set(false);
    this.finalReview.emit();
    // Sua lógica de ativação aqui
  }

  // confirmAndFinish() {
  //   console.log('Championship setup finalized!', this.data());

  //   this.championshipService.createChampionship(this.data() as any).subscribe({
  //     next: (res) => {
  //       this.toastService.success('Campeonato criado com sucesso!');
  //       this.router.navigate(['/championships']);
  //     },
  //     error: (err) => {
  //       this.toastService.error('Erro ao criar campeonato. Verifique os dados.');
  //       console.error(err);
  //     },
  //   });
  // }

  returnToPrevious() {
    this.advanced.emit('teams');
  }
}
