import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { Message } from './message.entity';
import { Match } from '../matches/match.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createChatForMatch(matchId: string): Promise<Chat> {
    // Verificar que el match existe y es válido
    const match = await this.matchRepo.findOne({
      where: { id: matchId, isMatch: true },
      relations: ['user1', 'user2']
    });

    if (!match) {
      throw new Error('Match no encontrado o no válido');
    }

    // Verificar si ya existe un chat para este match
    const existingChat = await this.chatRepo.findOne({
      where: { matchId }
    });

    if (existingChat) {
      return existingChat;
    }

    // Crear nuevo chat
    const chat = this.chatRepo.create({
      matchId,
      match
    });

    return this.chatRepo.save(chat);
  }

  async getChatByMatchId(matchId: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepo.findOne({
      where: { matchId },
      relations: ['match', 'match.user1', 'match.user2', 'messages', 'messages.sender']
    });

    if (!chat) {
      throw new Error('Chat no encontrado');
    }

    // Verificar que el usuario es parte del match
    if (chat.match.user1Id !== userId && chat.match.user2Id !== userId) {
      throw new Error('No tienes acceso a este chat');
    }

    return chat;
  }

  async getChatsForUser(userId: string): Promise<Chat[]> {
    return this.chatRepo.find({
      where: [
        { match: { user1Id: userId, isMatch: true } },
        { match: { user2Id: userId, isMatch: true } }
      ],
      relations: ['match', 'match.user1', 'match.user2', 'messages', 'messages.sender'],
      order: { createdAt: 'DESC' }
    });
  }

  async getChatById(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['match', 'match.user1', 'match.user2', 'messages', 'messages.sender']
    });

    if (!chat) {
      throw new Error('Chat no encontrado');
    }

    // Verificar que el usuario es parte del match
    if (chat.match.user1Id !== userId && chat.match.user2Id !== userId) {
      throw new Error('No tienes acceso a este chat');
    }

    return chat;
  }

  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    // Verificar que el chat existe y el usuario es parte del match
    const chat = await this.getChatById(chatId, senderId);

    // Verificar que el usuario existe
    const sender = await this.userRepo.findOneBy({ id: senderId });
    if (!sender) {
      throw new Error('Usuario no encontrado');
    }

    // Crear mensaje
    const message = this.messageRepo.create({
      chatId,
      senderId,
      content
    });

    return this.messageRepo.save(message);
  }

  async getMessagesForChat(chatId: string, userId: string): Promise<Message[]> {
    // Verificar acceso al chat
    await this.getChatById(chatId, userId);

    return this.messageRepo.find({
      where: { chatId },
      relations: ['sender'],
      order: { createdAt: 'ASC' }
    });
  }
} 