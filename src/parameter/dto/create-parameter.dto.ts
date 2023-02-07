import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateParameterDto {
  @IsString()
  @IsNotEmpty()
  default: string;

  @MinLength(5)
  @MaxLength(50)
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @MinLength(10)
  @MaxLength(253)
  @IsString()
  @IsOptional()
  description: string;
}
