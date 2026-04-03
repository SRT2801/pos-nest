import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export class TransactionContentsDto {
  @IsNotEmpty({ message: 'The product ID cannot be empty.' })
  @IsInt({ message: 'Invalid product.' })
  productId: number;

  @IsNotEmpty({ message: 'Quantity cannot be empty.' })
  @IsInt({ message: 'Invalid quantity.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity: number;

  @IsNotEmpty({ message: 'Price cannot be empty.' })
  @IsNumber({}, { message: 'Invalid price.' })
  @Min(0.01, { message: 'Price must be greater than 0.' })
  price: number;
}

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'Total cannot be empty.' })
  @IsNumber({}, { message: 'Invalid total.' })
  @Min(0, { message: 'Total cannot be negative.' })
  total: number;

  @IsOptional()
  coupon: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Contents cannot be empty.' })
  @ValidateNested({ each: true })
  @Type(() => TransactionContentsDto)
  contents: TransactionContentsDto[];
}
