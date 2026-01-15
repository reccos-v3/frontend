import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { IRole } from '../interfaces/roles.interface';

interface CachedRoles {
  data: IRole[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly CACHE_KEY = 'app_roles_cache';
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hora em milissegundos
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Cache em memória para acesso rápido durante a sessão
  private memoryCache$ = new BehaviorSubject<IRole[] | null>(null);

  /**
   * Verifica se está no browser
   */
  private isBrowserPlatform(): boolean {
    return this.isBrowser;
  }

  /**
   * Obtém roles do cache do localStorage
   */
  private getCachedFromStorage(): IRole[] | null {
    if (!this.isBrowserPlatform()) {
      return null;
    }

    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached);

      // Verifica se é o formato antigo (objeto direto da API) e converte
      if (parsed && typeof parsed === 'object') {
        // Se tem propriedade 'data' e 'timestamp', é o formato correto do cache
        if ('data' in parsed && 'timestamp' in parsed) {
          const cacheData = parsed as CachedRoles;
          const now = Date.now();

          // Verifica se o cache ainda é válido (não expirou)
          if (now - cacheData.timestamp > this.CACHE_TTL) {
            localStorage.removeItem(this.CACHE_KEY);
            return null;
          }

          // Garante que retorna um array válido
          if (cacheData.data && Array.isArray(cacheData.data)) {
            return cacheData.data;
          }
        }
        // Se for um array direto (formato antigo), converte para o novo formato
        else if (Array.isArray(parsed)) {
          // Converte formato antigo para o novo formato e retorna o array
          const roles = parsed as IRole[];
          this.setCache(roles); // Salva no formato correto
          return roles;
        }
      }

      // Se a estrutura estiver incorreta, limpa o cache
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Erro ao ler cache de roles:', error);
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    }
  }

  /**
   * Salva roles no cache (memória + localStorage)
   */
  private setCache(roles: IRole[]): void {
    // Atualiza cache em memória
    this.memoryCache$.next(roles);

    // Salva no localStorage
    if (this.isBrowserPlatform()) {
      try {
        const cacheData: CachedRoles = {
          data: roles,
          timestamp: Date.now(),
        };
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Erro ao salvar cache de roles:', error);
      }
    }
  }

  /**
   * Limpa o cache (memória + localStorage)
   */
  clearCache(): void {
    this.memoryCache$.next(null);
    if (this.isBrowserPlatform()) {
      localStorage.removeItem(this.CACHE_KEY);
    }
  }

  /**
   * Obtém roles do cache de forma síncrona (para uso direto no componente)
   * Retorna null se não houver cache válido
   */
  getRolesFromCache(): IRole[] | null {
    // 1. Verifica cache em memória primeiro
    const memoryCache = this.memoryCache$.value;
    if (memoryCache && Array.isArray(memoryCache) && memoryCache.length > 0) {
      return memoryCache;
    }

    // 2. Verifica cache no localStorage
    return this.getCachedFromStorage();
  }

  /**
   * Obtém roles com cache inteligente
   * Prioriza cache em memória > localStorage > API
   */
  getCachedRoles(): Observable<IRole[]> {
    // 1. Verifica cache em memória primeiro (mais rápido)
    const memoryCache = this.memoryCache$.value;
    if (memoryCache && Array.isArray(memoryCache) && memoryCache.length > 0) {
      return of(memoryCache);
    }

    // 2. Verifica cache no localStorage
    const storageCache = this.getCachedFromStorage();
    if (storageCache && Array.isArray(storageCache) && storageCache.length > 0) {
      // Atualiza cache em memória para próximas chamadas
      this.memoryCache$.next(storageCache);
      return of(storageCache);
    }

    // 3. Se não houver cache, busca da API
    return this.getAllRoles().pipe(
      tap((roles) => {
        // Garante que temos um array válido antes de salvar
        if (Array.isArray(roles) && roles.length > 0) {
          this.setCache(roles);
        }
      }),
      catchError((error) => {
        console.error('Erro ao buscar roles:', error);
        // Retorna array vazio em caso de erro
        return of([]);
      })
    );
  }

  /**
   * Busca roles da API (sem usar cache)
   * Trata resposta que pode vir como array direto ou objeto com propriedade data
   */
  getAllRoles(): Observable<IRole[]> {
    return this.http.get<IRole[] | { data: IRole[] }>(`${environment.apiUrl}/roles`).pipe(
      map((response) => {
        // Se a resposta vier como objeto com propriedade data, extrai o array
        if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          Array.isArray((response as { data: IRole[] }).data)
        ) {
          return (response as { data: IRole[] }).data;
        }
        // Se já vier como array, retorna diretamente
        if (Array.isArray(response)) {
          return response;
        }
        // Fallback: retorna array vazio
        return [];
      }),
      catchError((error) => {
        console.error('Erro ao buscar roles da API:', error);
        return of([]);
      })
    );
  }

  /**
   * Força atualização dos roles (ignora cache)
   */
  refreshRoles(): Observable<IRole[]> {
    this.clearCache();
    return this.getAllRoles().pipe(
      tap((roles) => {
        this.setCache(roles);
      })
    );
  }
}
