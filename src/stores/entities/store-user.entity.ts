import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Store } from './store.entity';
import { Role } from '../../auth/enums/role.enum';
import { Permission } from '../../auth/enums/permission.enum';

@Entity()
@Unique(['userId', 'storeId'])
export class StoreUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @Column({ type: 'enum', enum: Role, default: Role.STAFF })
  role: Role;

  @Column({ type: 'jsonb', default: [] })
  permissions: Permission[];

  @ManyToOne(() => Store, (store) => store.storeUsers, {
    onDelete: 'CASCADE',
  })
  store: Store;
}
