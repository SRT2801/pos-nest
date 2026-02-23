import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { IdValidationPipe } from '../common/pipes/id-validation/id-validation.pipe';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles('admin')
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id', IdValidationPipe) id: string) {
    return this.couponsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', IdValidationPipe) id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponsService.update(+id, updateCouponDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(+id);
  }

  @Post('/apply-coupon')
  @HttpCode(HttpStatus.OK)
  applyCoupon(@Body() applyCouponDto: ApplyCouponDto) {
    return this.couponsService.applyCoupon(applyCouponDto.name);
  }
}
