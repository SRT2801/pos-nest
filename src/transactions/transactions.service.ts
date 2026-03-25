import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Transaction,
  TransactionContents,
} from './entities/transaction.entity.js';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity.js';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';
import { CouponsService } from '../coupons/coupons.service.js';
import { AuthUser } from '../auth/interfaces/auth-user.interface.js';
import { Role } from '../auth/enums/role.enum.js';
import { StoreScopedService } from '../common/services/store-scoped.service.js';
import { StoreContextService } from '../common/cls/store-context.service.js';

@Injectable()
export class TransactionsService extends StoreScopedService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents)
    private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly couponsService: CouponsService,
    storeContext: StoreContextService,
  ) {
    super(transactionRepository, storeContext);
  }

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    const storeId = this.getRequiredStoreId();

    await this.productRepository.manager.transaction(
      async (transactionEntityManager) => {
        const transaction = new Transaction();
        const total = createTransactionDto.contents.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
        transaction.total = total;
        transaction.discount = 0;
        transaction.transactionDate = new Date();
        transaction.userId = userId;
        transaction.storeId = storeId;

        if (createTransactionDto.coupon) {
          const coupon = await this.couponsService.applyCoupon(
            createTransactionDto.coupon,
          );
          const discount = (coupon.percentage / 100) * total;
          transaction.discount = discount;
          transaction.coupon = coupon.name;
          transaction.total = total - discount;
        }

        await transactionEntityManager.save(transaction);

        for (const contents of createTransactionDto.contents) {
          const product = await transactionEntityManager.findOneBy(Product, {
            id: contents.productId,
            storeId,
          });

          if (!product) {
            throw new NotFoundException([
              `Product with ID: ${contents.productId} not found`,
            ]);
          }

          if (!product.isActive) {
            throw new BadRequestException([
              `Product ${product.name} is no longer available`,
            ]);
          }

          if (contents.quantity > product.inventory) {
            throw new BadRequestException([
              `Insufficient inventory for the product ${product.name}`,
            ]);
          }

          product.inventory -= contents.quantity;

          const transactionContent = new TransactionContents();
          transactionContent.quantity = contents.quantity;
          transactionContent.price = contents.price;
          transactionContent.product = product;
          transactionContent.transaction = transaction;

          await transactionEntityManager.save(product);
          await transactionEntityManager.save(transactionContent);
        }
      },
    );
    return { message: 'sale successfully created' };
  }

  findAll(transactionDate?: string, user?: AuthUser) {
    const options: FindManyOptions<Transaction> = {
      relations: {
        contents: true,
      },
    };

    if (transactionDate) {
      const date = parseISO(transactionDate);
      if (!isValid(date)) {
        throw new BadRequestException('Invalid date format');
      }

      const start = startOfDay(date);
      const end = endOfDay(date);

      options.where = {
        transactionDate: Between(start, end),
      };
    }

    if (user && user.role !== Role.ADMIN && user.role !== Role.OWNER) {
      options.where = {
        ...options.where,
        userId: user.id,
      };
    }

    return this.scopedFind(options);
  }

  async findOne(id: number, user?: AuthUser) {
    const transaction = await this.scopedFindOne({
      where: { id },
      relations: {
        contents: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (
      user &&
      user.role !== Role.ADMIN &&
      user.role !== Role.OWNER &&
      transaction.userId !== user.id
    ) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async remove(id: number) {
    const transaction = await this.scopedFindOne({
      where: { id },
      relations: {
        contents: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    for (const contents of transaction.contents) {
      const product = await this.productRepository.findOneBy({
        id: contents.product.id,
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${contents.product.id} not found`,
        );
      }
      product.inventory += contents.quantity;
      await this.productRepository.save(product);
      const transactionContents =
        await this.transactionContentsRepository.findOneBy({ id: contents.id });
      if (transactionContents) {
        await this.transactionContentsRepository.remove(transactionContents);
      }
    }

    await this.transactionRepository.remove(transaction);
    return { message: 'sale successfully deleted' };
  }
}
