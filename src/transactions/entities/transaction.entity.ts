import { Product } from '../../products/entities/product.entity';
import { Store } from '../../stores/entities/store.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['storeId', 'id'])
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column('decimal')
  total: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  coupon: string;

  @Column({ type: 'decimal', default: 0 })
  discount: number;

  @Column({ type: 'timestamp without time zone' })
  transactionDate: Date;

  @Column({ type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  store: Store;

  @OneToMany(
    () => TransactionContents,
    (transactions) => transactions.transaction,
  )
  contents: TransactionContents[];
}

@Entity()
export class TransactionContents {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  quantity: number;

  @Column('decimal')
  price: number;

  @ManyToOne(() => Product, (product) => product.id, {
    eager: true,
    cascade: true,
  })
  product: Product;

  @ManyToOne(() => Transaction, (transaction) => transaction.contents, {
    cascade: true,
  })
  transaction: Transaction;
}
