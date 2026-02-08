import { Type } from "class-transformer";
import {  ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, Length, ValidateNested } from "class-validator";

export class TransactionContentsDto {
  @IsNotEmpty({ message: 'The product ID cannot be empty.' })
  @IsInt({ message: 'Invalid product.' })
  productId: number;

  @IsNotEmpty({ message: 'Quantity cannot be empty.' })
  @IsInt({ message: 'Invalid quantity.' }) 
  quantity: number;

  @IsNotEmpty({ message: 'Price cannot be empty.' })
  @IsNumber({}, { message: 'Invalid price.' })
  price: number;
}

export class CreateTransactionDto {
  @IsNotEmpty({message: 'Total cannot be empty.'})
  @IsNumber({}, {message: 'Invalid total.'})
  total: number

  @IsArray()
  @ArrayNotEmpty({message: 'Contents cannot be empty.'})
  @ValidateNested()
  @Type(() => TransactionContentsDto)
  contents: TransactionContentsDto[]
}