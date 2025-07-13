import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Match } from '../matches/match.entity';
import { Message } from './message.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid') id: string;

  @OneToOne(() => Match, { eager: true })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column()
  matchId: string;

  @OneToMany(() => Message, message => message.chat)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;
} 