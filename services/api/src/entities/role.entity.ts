import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  UNDERWRITER = 'UNDERWRITER',
  CLAIMS_ADJUSTER = 'CLAIMS_ADJUSTER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  DEALER = 'DEALER',
  AGENT = 'AGENT',
  CUSTOMER = 'CUSTOMER',
}

@Entity('roles')
@Index(['tenantId', 'name'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  tenantId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    nullable: true,
  })
  type: RoleType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  permissions: string[];

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  attributes: string[];

  @Column({ default: false })
  isSystem: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
