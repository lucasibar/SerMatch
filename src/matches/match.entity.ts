import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  @Column()
  user1Id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user2Id' })
  user2: User;

  @Column()
  user2Id: string;

  @Column({ default: false })
  user1Liked: boolean;

  @Column({ default: false })
  user2Liked: boolean;

  @Column({ default: false })
  isMatch: boolean;

  @CreateDateColumn()
  createdAt: Date;
} 