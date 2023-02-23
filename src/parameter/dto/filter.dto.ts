import { IsOptional, IsString } from 'class-validator';

export class Filter {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  category: string;
}
