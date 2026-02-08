import { IsNumberString, IsOptional } from 'class-validator';

export class GetProductsQueryDto {
  @IsOptional()
  @IsNumberString({}, { message: 'The category_id must be a number' })
  category_id?: number;

  @IsOptional()
  @IsNumberString({}, { message: 'the quantity must be a number' })
  take?: number;

  @IsOptional()
  @IsNumberString({}, { message: 'the quantity must be a number' })
  skip?: number;
}
