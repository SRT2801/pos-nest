import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity.js';
import { Repository } from 'typeorm';
import { endOfDay, isAfter } from 'date-fns';
import { StoreScopedService } from '../common/services/store-scoped.service.js';
import { StoreContextService } from '../common/cls/store-context.service.js';

@Injectable()
export class CouponsService extends StoreScopedService<Coupon> {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    storeContext: StoreContextService,
  ) {
    super(couponRepository, storeContext);
  }

  create(createCouponDto: CreateCouponDto) {
    return this.scopedSave(createCouponDto as Partial<Coupon>);
  }

  findAll() {
    return this.scopedFind();
  }

  async findOne(id: number) {
    const coupon = await this.scopedFindOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    Object.assign(coupon, updateCouponDto);

    return this.couponRepository.save(coupon);
  }

  async remove(id: number) {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
    return { message: 'Coupon removed successfully' };
  }

  async applyCoupon(name: string) {
    const coupon = await this.scopedFindOne({ where: { name } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    const currentDate = new Date();
    const expirationDate = endOfDay(coupon.expirationDate);
    if (isAfter(currentDate, expirationDate)) {
      throw new UnprocessableEntityException('Coupon has expired');
    }
    return {
      message: 'Coupon applied successfully',
      coupon: {
        name: coupon.name,
        percentage: coupon.percentage,
      },
    };
  }
}
