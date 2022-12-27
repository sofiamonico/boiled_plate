import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(70)
  description: string;
}
