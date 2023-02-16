import 'reflect-metadata';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { PaginatedResponse } from '../../types/pagination.types';

export class Pagination {
  @Type(() => Number)
  @IsNumber()
  page = 1;

  @Type(() => Number)
  @IsNumber()
  page_size = 20;

  get skip(): number {
    return (this.page - 1) * this.page_size;
  }

  private getTotalPages(amountCategories: number): number {
    return Math.ceil(amountCategories / this.page_size);
  }

  buildPaginatedResponse<T>(data: any[]): PaginatedResponse<T> {
    //capture the number of existing categories. If not exist none category,
    // amountCategories is equal to 0
    const amountCategories =
      data[0].totalCount.length === 0 ? 0 : data[0].totalCount[0].count;
    //function that calculates the total number of pages
    const amountPages = this.getTotalPages(amountCategories);

    return {
      'X-pagination-total-count': amountCategories,
      'X-pagination-page-count': amountPages,
      'X-pagination-current-page': this.page,
      'X-pagination-page-size': this.page_size,
      data: data[0].data,
    };
  }
}
