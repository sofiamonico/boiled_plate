import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

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
}
