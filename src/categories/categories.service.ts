import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category } from './entities/category.entity.js';
import { FindManyOptions, Repository } from 'typeorm';
import { StoreScopedService } from '../common/services/store-scoped.service.js';
import { StoreContextService } from '../common/cls/store-context.service.js';

@Injectable()
export class CategoriesService extends StoreScopedService<Category> {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    storeContext: StoreContextService,
  ) {
    super(categoryRepository, storeContext);
  }

  create(createCategoryDto: CreateCategoryDto) {
    return this.scopedSave(createCategoryDto as Partial<Category>);
  }

  findAll() {
    return this.scopedFind();
  }

  async findOne(id: number, products?: boolean) {
    const options: FindManyOptions<Category> = {
      where: { id },
    };

    if (products) {
      options.relations = {
        products: true,
      };
      options.order = {
        products: {
          id: 'ASC',
        },
      };
    }

    const category = await this.scopedFindOne(options);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    category.name = updateCategoryDto.name;
    return await this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    return await this.categoryRepository.remove(category);
  }
}
