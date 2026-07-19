export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  metadata: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
  };
}

export type Identifiable = {
  id: string;
  createdAt: string;
  updatedAt: string;
};
