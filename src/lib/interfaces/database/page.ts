interface Page<T> {
  content: T[];
  total: number;
  page: number;
  pageSize: number;
}
