import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SlugDto {
  @MinLength(5)
  @MaxLength(50)
  @IsNotEmpty()
  @IsString()
  slug: string;
}
