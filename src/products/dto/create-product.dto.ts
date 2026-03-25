import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'The product name is required.' })
  @IsString({ message: 'Tinvalid name.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Invalid description.' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @IsNotEmpty({ message: 'The product price is required.' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'The product price must be a number.' },
  )
  price: number;

  @IsNotEmpty({ message: 'The product image is required.' })
  image: string;

  @IsNotEmpty({ message: 'The quantity cannot be empty.' })
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'invalid amount of inventory' })
  inventory: number;

  @IsNotEmpty({ message: 'The category ID is required.' })
  @IsInt({ message: 'Invalid category ' })
  categoryId: number;
}
