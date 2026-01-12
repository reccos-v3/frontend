/**
 * Interface genérica para representar uma resposta paginada do Spring Boot
 * Compatível com Spring Data Page<T>
 */
export interface IPage<T> {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: T[];
  number: number;
  sort: ISort;
  numberOfElements: number;
  pageable: IPageable;
  empty: boolean;
}

/**
 * Interface para informações de ordenação
 */
export interface ISort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

/**
 * Interface para informações de paginação
 */
export interface IPageable {
  offset: number;
  sort: ISort;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}
