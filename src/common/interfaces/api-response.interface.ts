export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}
