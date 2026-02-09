import { IsDateString, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateCouponDto {
  @IsNotEmpty({ message: 'The coupon name is required' })
  name: string;

  @IsNotEmpty({ message: 'The discount cannot be empty' })
  @IsInt({ message: 'The discount must be between 1 and 100' })
  @Max(100, { message: 'The maximum discount is 100' })
  @Min(1, { message: 'The minimum discount is 1' })
  percentage: number;

  @IsNotEmpty({ message: 'The expiration date is required' })
  @IsDateString({},{ message: 'The expiration date must be a valid date string' },)
  expirationDate: Date;
}
