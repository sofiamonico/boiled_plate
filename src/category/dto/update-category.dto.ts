import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(20)
  @MaxLength(70)
  description: string;

  get slug(): string {
    return this.name.toLowerCase().split(' ').join('_');
  }
}
