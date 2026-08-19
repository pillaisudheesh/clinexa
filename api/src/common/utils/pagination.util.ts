import { PaginatedResponseDto } from '../dto/paginated-response.dto';

export class PaginationUtil {
  static createResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponseDto<T> {
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
