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

  @IsString()
  @MinLength(5)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @MinLength(10)
  @MaxLength(253)
  @IsOptional()
  description: string;
}
