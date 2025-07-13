import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { User } from '../users/user.entity';
import { ChatsService } from '../chats/chats.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly chatsService: ChatsService,
  ) {}

  async likeUser(currentUserId: string, targetUserId: string): Promise<{ isMatch: boolean; match?: Match; chat?: any }> {
    // Verificar que ambos usuarios existen
    const currentUser = await this.userRepo.findOneBy({ id: currentUserId });
    const targetUser = await this.userRepo.findOneBy({ id: targetUserId });

    if (!currentUser || !targetUser) {
      throw new Error('Usuario no encontrado');
    }

    // Buscar si ya existe un match entre estos usuarios
    let match = await this.matchRepo.findOne({
      where: [
        { user1Id: currentUserId, user2Id: targetUserId },
        { user1Id: targetUserId, user2Id: currentUserId }
      ]
    });

    if (!match) {
      // Crear nuevo match
      match = this.matchRepo.create({
        user1Id: currentUserId,
        user2Id: targetUserId,
        user1Liked: true,
        user2Liked: false,
        isMatch: false
      });
    } else {
      // Actualizar match existente
      if (match.user1Id === currentUserId) {
        match.user1Liked = true;
      } else {
        match.user2Liked = true;
      }
    }

    // Verificar si es un match mutuo
    const isMatch = match.user1Liked && match.user2Liked;
    match.isMatch = isMatch;

    await this.matchRepo.save(match);

    let chat = null;
    if (isMatch) {
      // Crear chat automáticamente cuando hay match
      chat = await this.chatsService.createChatForMatch(match.id);
    }

    return { isMatch, match, chat };
  }

  async getMatchesForUser(userId: string): Promise<Match[]> {
    return this.matchRepo.find({
      where: [
        { user1Id: userId, isMatch: true },
        { user2Id: userId, isMatch: true }
      ],
      relations: ['user1', 'user2'],
      order: { createdAt: 'DESC' }
    });
  }

  async getLikesForUser(userId: string): Promise<Match[]> {
    return this.matchRepo.find({
      where: [
        { user2Id: userId, user1Liked: true, user2Liked: false },
        { user1Id: userId, user2Liked: true, user1Liked: false }
      ],
      relations: ['user1', 'user2'],
      order: { createdAt: 'DESC' }
    });
  }
} 