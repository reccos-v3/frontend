import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RolesService } from '../services/roles.service';
import { IRole } from '../components/interfaces/roles.interface';

/**
 * Resolver que pré-carrega os roles antes de ativar a rota
 * Usa cache do RolesService para evitar chamadas desnecessárias
 */
export const rolesResolver: ResolveFn<IRole[]> = async () => {
  const rolesService = inject(RolesService);
  try {
    const roles = await firstValueFrom(rolesService.getCachedRoles());
    // Garante que retorna um array válido
    return Array.isArray(roles) ? roles : [];
  } catch (error) {
    console.error('Erro no resolver de roles:', error);
    return [];
  }
};
