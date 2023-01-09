export type PaginatedResponse<T> = {
  'X-pagination-total-count': number;
  'X-pagination-page-count': number;
  'X-pagination-current-page': number;
  'X-pagination-page-size': number;
  data: T[];
};
