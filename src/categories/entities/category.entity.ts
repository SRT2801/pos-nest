import { Product } from '../../products/entities/product.entity';
import { Store } from '../../stores/entities/store.entity';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['storeId', 'id'])
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 60 })
  name: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  store: Store;

  @OneToMany(() => Product, (product) => product.category, { cascade: true })
  products: Product[];
}
