import { IsIn, IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateProductDto {

    @IsNotEmpty({message: 'The product name is required.'})
    @IsString({message: 'Tinvalid name.'})
    name: string;

    @IsNotEmpty({message: 'The product price is required.'})
    @IsNumber({maxDecimalPlaces: 2}, {message: 'The product price must be a number.'})
    price: number;


    @IsNotEmpty({message: 'The quantity cannot be empty.'})
    @IsNumber({maxDecimalPlaces: 0}, {message: 'invalid amount of inventory'})
    inventory: number;

    @IsNotEmpty({message: 'The category ID is required.'})
    @IsInt({message: 'Invalid category '})
    categoryId: number;
}
