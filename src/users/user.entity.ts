import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() name: string;
  @Column({ unique: true }) email: string;
  @Column() password: string;
  @Column({ nullable: true, type: 'text' }) profilePhoto: string; // base64
  @Column({ nullable: true, type: 'text' }) bio: string;
  @Column({ default: 'pareja' }) lookingFor: string;

  @CreateDateColumn() createdAt: Date;
} 