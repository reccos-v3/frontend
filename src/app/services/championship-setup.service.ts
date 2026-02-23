import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError, Observable, OperatorFunction } from 'rxjs';
import {
  IAdvancedSettingsRequest,
  IBracketConfigRequest,
  IFormatAndStructureRequest,
  IFormatRequest,
  IMatchRulesRequest,
  IPeriodsAndTransferWindowsRequest,
  IPeriodsAndTransferWindowsResponse,
  IRulesAndScoringRequest,
  ISeedingPoliciesRequest,
  ITeamSelectionRequest,
  IUpdateRulesAndScoringResponse,
} from '../interfaces/championship-setup.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChampionshipSetupService {
  private http = inject(HttpClient);

  private buildUrl(championshipId: string, endpoint: string): string {
    return `${environment.apiUrl}/championships/${championshipId}/${endpoint}`;
  }

  private handleError<T>(context: string): OperatorFunction<T, T> {
    return catchError((error: unknown) => {
      console.error(context, error);
      return throwError(() => error);
    });
  }

  // ✅ AGORA TIPADO CORRETAMENTE
  private put<T>(championshipId: string, endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(this.buildUrl(championshipId, endpoint), body)
      .pipe(this.handleError<T>(`Erro ao atualizar ${endpoint}`));
  }

  private get<T>(championshipId: string, endpoint: string): Observable<T> {
    return this.http
      .get<T>(this.buildUrl(championshipId, endpoint))
      .pipe(this.handleError<T>(`Erro ao buscar ${endpoint}`));
  }

  private post<T>(championshipId: string, endpoint: string, body?: unknown): Observable<T> {
    return this.http
      .post<T>(this.buildUrl(championshipId, endpoint), body)
      .pipe(this.handleError<T>(`Erro ao executar ${endpoint}`));
  }

  // =========================
  // MÉTODOS ESPECÍFICOS
  // =========================

  updateRulesAndScoring(
    championshipId: string,
    request: IRulesAndScoringRequest,
  ): Observable<IUpdateRulesAndScoringResponse> {
    return this.put<IUpdateRulesAndScoringResponse>(championshipId, 'rules', request);
  }

  updateStructure(
    championshipId: string,
    request: IFormatAndStructureRequest,
  ): Observable<IFormatAndStructureRequest> {
    return this.put<IFormatAndStructureRequest>(championshipId, 'structure', request);
  }

  updateFormat(championshipId: string, request: IFormatRequest): Observable<IFormatRequest> {
    return this.put<IFormatRequest>(championshipId, 'format', request);
  }

  updatePeriodsAndTransferWindows(
    championshipId: string,
    request: IPeriodsAndTransferWindowsRequest,
  ): Observable<IPeriodsAndTransferWindowsResponse> {
    return this.put<IPeriodsAndTransferWindowsResponse>(championshipId, 'period', request);
  }

  updateBracketConfig(
    championshipId: string,
    request: IBracketConfigRequest,
  ): Observable<IBracketConfigRequest> {
    return this.put<IBracketConfigRequest>(championshipId, 'bracket-config', request);
  }

  updateTeamSelectionRequest(
    championshipId: string,
    request: ITeamSelectionRequest,
  ): Observable<ITeamSelectionRequest> {
    return this.put<ITeamSelectionRequest>(championshipId, 'teams', request);
  }

  updateSeedingPolicies(
    championshipId: string,
    request: ISeedingPoliciesRequest,
  ): Observable<ISeedingPoliciesRequest> {
    return this.put<ISeedingPoliciesRequest>(championshipId, 'seeding/policy', request);
  }

  updateMatchRules(
    championshipId: string,
    request: IMatchRulesRequest,
  ): Observable<IMatchRulesRequest> {
    return this.put<IMatchRulesRequest>(championshipId, 'match-rules', request);
  }

  updateSettings(
    championshipId: string,
    request: IAdvancedSettingsRequest,
  ): Observable<IAdvancedSettingsRequest> {
    return this.put<IAdvancedSettingsRequest>(championshipId, 'settings', request);
  }

  getSetup(championshipId: string): Observable<unknown> {
    return this.get<unknown>(championshipId, 'setup');
  }

  getReview(championshipId: string): Observable<unknown> {
    return this.get<unknown>(championshipId, 'review');
  }

  activateChampionship(championshipId: string): Observable<unknown> {
    return this.post<unknown>(championshipId, 'activate');
  }
}
