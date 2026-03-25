import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';
import { FindManyOptions, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { TransactionContents } from '../transactions/entities/transaction.entity.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreScopedService } from '../common/services/store-scoped.service.js';
import { StoreContextService } from '../common/cls/store-context.service.js';

@Injectable()
export class ProductsService extends StoreScopedService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(TransactionContents)
    private readonly transactionContentsRepository: Repository<TransactionContents>,
    storeContext: StoreContextService,
  ) {
    super(productRepository, storeContext);
  }

  async create(createProductDto: CreateProductDto) {
    const storeId = this.getRequiredStoreId();
    const category = await this.categoryRepository.findOneBy({
      id: createProductDto.categoryId,
      storeId,
    });
    if (!category) {
      throw new NotFoundException(['Category not found']);
    }

    return this.scopedSave({
      ...createProductDto,
      category,
    } as Partial<Product>);
  }

  async findAll(categoryId: number | null, take: number, skip: number) {
    const options: FindManyOptions<Product> = {
      relations: { category: true },
      order: { id: 'DESC' },
      take,
      skip,
      where: { isActive: true },
    };

    if (categoryId) {
      options.where = { isActive: true, category: { id: categoryId } };
    }

    const [products, total] = await this.scopedFindAndCount(options);

    return { products, total };
  }

  async findOne(id: number) {
    const product = await this.scopedFindOne({
      where: { id, isActive: true },
      relations: { category: true },
    });

    if (!product) {
      throw new NotFoundException(['Product not found']);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);

    if (updateProductDto.categoryId) {
      const storeId = this.getRequiredStoreId();
      const category = await this.categoryRepository.findOneBy({
        id: updateProductDto.categoryId,
        storeId,
      });
      if (!category) {
        throw new NotFoundException(['Category not found']);
      }
      product.category = category;
    }

    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    const salesCount = await this.transactionContentsRepository.countBy({
      product: { id: product.id },
    });

    if (salesCount > 0) {
      product.isActive = false;
      await this.productRepository.save(product);
      return { message: 'Product archived successfully (has sales history)' };
    }

    await this.productRepository.remove(product);
    return { message: 'Product removed successfully' };
  }
}
