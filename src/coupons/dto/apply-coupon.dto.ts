import { IsNotEmpty } from "class-validator";

export class ApplyCouponDto {
    @IsNotEmpty({ message: 'The coupon code is required' })
    name: string;
}