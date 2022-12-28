import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  name: string;

  @MinLength(20)
  @MaxLength(70)
  @IsString()
  @IsNotEmpty()
  description: string;
}
