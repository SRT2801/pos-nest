import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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
  @Min(0.01, { message: 'The product price must be greater than 0.' })
  price: number;

  @IsNotEmpty({ message: 'The product images are required.' })
  @IsArray()
  @IsString({ each: true, message: 'Each image must be a valid URL/string.' })
  images: string[];

  @IsNotEmpty({ message: 'The quantity cannot be empty.' })
  @IsInt({ message: 'invalid amount of inventory' })
  @Min(0, { message: 'Inventory cannot be negative.' })
  inventory: number;

  @IsNotEmpty({ message: 'The category ID is required.' })
  @IsInt({ message: 'Invalid category ' })
  categoryId: number;
}
