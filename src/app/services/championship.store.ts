import { Injectable, computed, inject, signal } from '@angular/core';
import { ChampionshipService } from '../services/championship.service';
import { IChampionshipResponse } from '../interfaces/championship.interface';

@Injectable({
  providedIn: 'root',
})
export class ChampionshipStore {
  private championshipService = inject(ChampionshipService);
  private _championship = signal<IChampionshipResponse | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _currentId = signal<string | null>(null);
  championship = this._championship.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  canEdit = computed(() => {
    const c = this._championship();
    return c ? c.status !== 'ACTIVE' : false;
  });

  progress = computed(() => this._championship()?.progress ?? null);

  isReady = computed(() => !this._loading() && !!this._championship());
  ensureLoaded(id: string): void {
    if (this._currentId() === id && this._championship()) {
      return;
    }

    this.load(id);
  }
  reload(): void {
    const id = this._currentId();
    if (id) {
      this.load(id, true);
    }
  }

  update(patch: Partial<IChampionshipResponse>): void {
    const current = this._championship();
    if (!current) return;

    this._championship.set({
      ...current,
      ...patch,
    });
    console.log('ESTAMOS NO UPDATE ARA ATUALIZAR CAMPEONATO', this._championship());
  }

  replace(championship: IChampionshipResponse): void {
    this._championship.set(championship);
    this._currentId.set(championship.id);
  }

  clear(): void {
    this._championship.set(null);
    this._currentId.set(null);
    this._error.set(null);
    this._loading.set(false);
  }

  private load(id: string, force = false): void {
    if (this._loading() && !force) return;

    this._loading.set(true);
    this._error.set(null);
    this._currentId.set(id);

    this.championshipService.getChampionshipById(id).subscribe({
      next: (data) => {
        this._championship.set(data);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar campeonato', err);
        this._error.set('Erro ao carregar campeonato');
        this._loading.set(false);
      },
    });
  }
}
