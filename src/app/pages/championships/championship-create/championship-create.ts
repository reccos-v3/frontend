import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SeasonTypeCard,
  SeasonTypeCardConfig,
  SeasonType,
} from './components/season-type-card/season-type-card';
import { IChampionshipRequest } from '../../../interfaces/championship.interface';
import { Observable } from 'rxjs';
import { ChampionshipService } from '../../../services/championship.service';
import { SeasonService } from '../../../services/season.service';
import { ISeasonRequest, ISeasonResponse } from '../../../interfaces/season.interface';
import { IAuth } from '../../../interfaces/auth.interface';
import { ModalityService } from '../../../services/modality.service';
import { IModalityResponse } from '../../../interfaces/modality.interface';
import { ToastService } from '../../../services/toast.service';
import { seasonTypeCards } from '../../../utils/mocks/season-type-cards';

interface ChampionshipFormData {
  name: string;
  modality: string;
  gender: 'masculino' | 'feminino' | 'misto';
  seasonType: 'existing' | 'new' | 'standalone';
  season: string | null;
  seasonName?: string;
  seasonStart?: string;
  seasonEnd?: string;
}

@Component({
  selector: 'app-championship-create',
  standalone: true,
  imports: [CommonModule, FormsModule, SeasonTypeCard],
  templateUrl: './championship-create.html',
  styleUrl: './championship-create.css',
})
export class ChampionshipCreate implements OnInit {
  private router = inject(Router);
  private seasonService = inject(SeasonService);
  private modalityService = inject(ModalityService);
  private championshipService = inject(ChampionshipService);
  private toastService = inject(ToastService);

  formData: ChampionshipFormData = {
    name: '',
    modality: '',
    gender: 'masculino',
    seasonType: 'existing',
    season: null,
    seasonName: '',
    seasonStart: '',
    seasonEnd: '',
  };

  isSubmitting = signal(false);
  seasons = signal<ISeasonResponse[]>([]);
  modalities = signal<IModalityResponse[]>([]);

  genderOptions = [
    { value: 'MASCULINO', label: 'Masculino' },
    { value: 'FEMININO', label: 'Feminino' },
    { value: 'MISTO', label: 'Misto' },
  ];

  seasonTypeCards: SeasonTypeCardConfig[] = seasonTypeCards;

  ngOnInit(): void {
    this.getSeasonsByFederationId();
    this.getModalities();
  }

  onSeasonTypeSelect(type: SeasonType): void {
    this.formData.seasonType = type;
  }

  onSeasonChange(value: string): void {
    this.formData.season = value;
  }

  onSeasonNameChange(value: string): void {
    this.formData.seasonName = value;
  }

  onSeasonStartChange(value: string): void {
    this.formData.seasonStart = value;
  }

  onSeasonEndChange(value: string): void {
    this.formData.seasonEnd = value;
  }

  isExistingSeasonMissing(): boolean {
    return this.formData.seasonType === 'existing' && !this.formData.season;
  }

  isNewSeasonMissing(): boolean {
    if (this.formData.seasonType !== 'new') {
      return false;
    }
    const nameOk = !!this.formData.seasonName?.trim();
    const startOk = !!this.formData.seasonStart;
    const endOk = !!this.formData.seasonEnd;
    return !(nameOk && startOk && endOk);
  }

  getSeasonSummary(): string {
    if (this.formData.seasonType === 'existing') {
      if (!this.formData.season) {
        return 'Selecionar temporada';
      }
      const season = this.seasons().find((s) => s.id === this.formData.season);
      return season ? season.name : 'Temporada selecionada';
    }

    if (this.formData.seasonType === 'new') {
      return this.formData.seasonName || 'Nova Temporada';
    }

    return 'Avulso';
  }

  onCancel(): void {
    // Navegar de volta ou fechar
    this.router.navigate(['/championships']);
  }

  onSubmit(): void {
    if (!this.formData.name || !this.formData.modality) {
      this.toastService.error('Preencha nome e modalidade.');
      return;
    }

    if (this.isExistingSeasonMissing()) {
      this.toastService.error('Selecione uma temporada existente.');
      return;
    }

    if (this.isNewSeasonMissing()) {
      this.toastService.error('Preencha nome, início e fim da nova temporada.');
      return;
    }

    // if (this.formData.seasonType === 'new') {
    //   this.createNewSeason();
    // } else {
    //   this.formData.season = null;
    //   this.createObjectToApi();
    // }

    this.formData.seasonType !== 'new' ? this.createObjectToApi() : this.createNewSeason();

    this.isSubmitting.set(true);
  }

  getModalities() {
    this.modalityService.getAllModalities().subscribe({
      next: (response: IModalityResponse[]) => {
        this.modalities.set(response);
      },
      error: (error) => {
        console.error('Erro ao buscar modalidades:', error);
      },
    });
  }

  getSeasonsByFederationId() {
    this.seasonService.getSeasonsByFederationId().subscribe({
      next: (response) => {
        console.log('Temporadas:', response);
        this.seasons.set(response);
        // Se não houver temporadas, força seleção de "new" para evitar card inútil
        if (response.length === 0 && this.formData.seasonType === 'existing') {
          this.formData.seasonType = 'new';
        }
      },
      error: (error) => {
        console.error('Erro ao buscar temporadas:', error);
      },
    });
  }

  createNewSeason() {
    const seasonRequest: ISeasonRequest = {
      name: this.formData.seasonName || '',
      startDate: new Date(this.formData.seasonStart || '').toISOString(),
      endDate: new Date(this.formData.seasonEnd || '').toISOString(),
    };
    this.seasonService.createSeason(seasonRequest).subscribe({
      next: (response) => {
        console.log('Temporada criada:', response);
        this.formData.season = response.id;
        setTimeout(() => {
          this.createObjectToApi();
        }, 1000);
      },
      error: (error) => {
        console.error('Erro ao criar temporada:', error);
      },
    });
  }

  createObjectToApi() {
    const objectToApi: IChampionshipRequest = {
      name: this.formData.name,
      modalityId: this.formData.modality,
      gender: this.formData.gender,
      type: this.formData.seasonType !== 'standalone' ? 'SEASONAL' : 'AVULSO',
      seasonId: this.formData.season || null,
    };

    this.createChampionship(objectToApi);
  }

  createChampionship(championship: IChampionshipRequest) {
    this.championshipService.createChampionship(championship).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        console.log('Campeonato criado:', response);
      },
      error: (error) => {
        console.error('Erro ao criar campeonato:', error);
      },
    });
  }
}
