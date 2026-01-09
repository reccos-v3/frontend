import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ChampionshipFormData {
  name: string;
  modality: string;
  disputeType: string;
  seasonType: 'season' | 'standalone';
  season: string;
}

@Component({
  selector: 'app-championship-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './championship-create.html',
  styleUrl: './championship-create.css',
})
export class ChampionshipCreate {
  private router = inject(Router);

  formData: ChampionshipFormData = {
    name: '',
    modality: '',
    disputeType: '',
    seasonType: 'season',
    season: '2024',
  };

  isSubmitting = signal(false);

  onCancel(): void {
    // Navegar de volta ou fechar
    this.router.navigate(['/championships']);
  }

  onSubmit(): void {
    if (!this.formData.name || !this.formData.modality || !this.formData.disputeType) {
      // Aqui você pode adicionar validação ou toast de erro
      return;
    }

    this.isSubmitting.set(true);

    // Aqui você fará a chamada ao serviço para criar o campeonato
    // Exemplo:
    // this.championshipService.createDraft(this.formData).subscribe({
    //   next: (response) => {
    //     this.router.navigate(['/championships', response.id]);
    //   },
    //   error: (error) => {
    //     console.error('Erro ao criar campeonato:', error);
    //     this.isSubmitting.set(false);
    //   }
    // });

    // Simulação temporária
    setTimeout(() => {
      this.isSubmitting.set(false);
      console.log('Form data:', this.formData);
    }, 2000);
  }
}
