import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Repository, DataSource } from 'typeorm';
import { categories } from './data/categories';
import { products } from './data/products';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const env = process.env.NODE_ENV ?? 'development';
    if (env === 'production') {
      throw new Error('Seeding with database reset is disabled in production');
    }

    const connection = this.dataSource;
    await connection.dropDatabase();
    await connection.synchronize();

    console.log('Cleaning database completed');
    console.log('Seeding categories...');
    await this.categoryRepository.save(categories);
    console.log(`${categories.length} categories inserted`);

    console.log('Seeding products...');
    for await (const seedProduct of products) {
      const category = await this.categoryRepository.findOneBy({
        id: seedProduct.categoryId,
      });
      if (!category) continue;
      const product = new Product();
      product.name = seedProduct.name;
      product.images = [seedProduct.image];
      product.price = seedProduct.price;
      product.inventory = seedProduct.inventory;
      product.category = category;
      await this.productRepository.save(product);
      console.log(`Product "${product.name}" inserted`);
    }

    console.log(`${products.length} products inserted`);
    console.log('Seeding complete!');
  }
}
