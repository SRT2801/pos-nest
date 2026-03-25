import { Category } from '../../categories/entities/category.entity';
import { Store } from '../../stores/entities/store.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['storeId', 'id'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 60 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'default.svg',
  })
  image: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'int' })
  inventory: number;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category)
  category: Category;

  @Column({ type: 'uuid' })
  storeId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  store: Store;
}
