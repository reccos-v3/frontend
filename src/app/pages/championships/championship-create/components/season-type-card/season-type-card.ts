import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ISeasonResponse } from '../../../../../interfaces/season.interface';
import { IModalityResponse } from '../../../../../interfaces/modality.interface';

export type SeasonType = 'existing' | 'new' | 'standalone';

export interface SeasonTypeCardConfig {
  type: SeasonType;
  icon: string;
  title: string;
  description: string;
  showCheckmark?: boolean;
  customContent?: 'select' | 'inputs' | 'badge';
  badgeText?: string;
}

@Component({
  selector: 'app-season-type-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './season-type-card.html',
  styleUrl: './season-type-card.css',
})
export class SeasonTypeCard {
  config = input.required<SeasonTypeCardConfig>();
  isSelected = input.required<boolean>();
  disabled = input<boolean>(false);
  missingExistingSeason = input<boolean>(false);
  missingNewSeason = input<boolean>(false);
  season = input<string>('');
  seasonName = input<string>('');
  seasonStart = input<string>('');
  seasonEnd = input<string>('');
  seasons = input<ISeasonResponse[]>([]);
  modalities = input<IModalityResponse[]>([]);
  // Local properties for ngModel binding
  localSeasonStart = '';
  localSeasonEnd = '';

  seasonChange = output<string>();
  seasonNameChange = output<string>();
  seasonStartChange = output<string>();
  seasonEndChange = output<string>();
  selectCard = output<SeasonType>();

  constructor() {
    // Sync local properties with input signals
    effect(() => {
      this.localSeasonStart = this.seasonStart();
      this.localSeasonEnd = this.seasonEnd();
    });
  }

  onSelect(): void {
    if (this.disabled()) {
      return;
    }
    this.selectCard.emit(this.config().type);
  }

  onSeasonChange(value: string): void {
    this.seasonChange.emit(value);
  }

  onSeasonNameChange(value: string): void {
    this.seasonNameChange.emit(value);
  }

  onSeasonStartChange(value: string): void {
    this.localSeasonStart = value;
    this.seasonStartChange.emit(value);
  }

  onSeasonEndChange(value: string): void {
    this.localSeasonEnd = value;
    this.seasonEndChange.emit(value);
  }
}
