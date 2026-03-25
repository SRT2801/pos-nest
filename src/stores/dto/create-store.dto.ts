import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'slug must be lowercase alphanumeric with hyphens only (e.g. my-store)',
  })
  slug: string;
}
