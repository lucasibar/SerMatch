import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChatsService } from './chats.service';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Get()
  async getMyChats(@Request() req) {
    const userId = req.user.id;
    const chats = await this.chatsService.getChatsForUser(userId);
    
    // Formatear respuesta para el frontend
    return chats.map(chat => {
      const otherUser = chat.match.user1Id === userId ? chat.match.user2 : chat.match.user1;
      const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
      
      return {
        id: chat.id,
        matchId: chat.matchId,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          profilePhoto: otherUser.profilePhoto
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt
        } : null,
        messageCount: chat.messages.length,
        createdAt: chat.createdAt
      };
    });
  }

  @Get('match/:matchId')
  async getChatByMatchId(@Request() req, @Param('matchId') matchId: string) {
    const userId = req.user.id;
    const chat = await this.chatsService.getChatByMatchId(matchId, userId);
    
    const otherUser = chat.match.user1Id === userId ? chat.match.user2 : chat.match.user1;
    
    return {
      id: chat.id,
      matchId: chat.matchId,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        profilePhoto: otherUser.profilePhoto
      },
      messages: chat.messages.map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        createdAt: message.createdAt
      })),
      createdAt: chat.createdAt
    };
  }

  @Get(':chatId')
  async getChat(@Request() req, @Param('chatId') chatId: string) {
    const userId = req.user.id;
    const chat = await this.chatsService.getChatById(chatId, userId);
    
    const otherUser = chat.match.user1Id === userId ? chat.match.user2 : chat.match.user1;
    
    return {
      id: chat.id,
      matchId: chat.matchId,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        profilePhoto: otherUser.profilePhoto
      },
      messages: chat.messages.map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        createdAt: message.createdAt
      })),
      createdAt: chat.createdAt
    };
  }

  @Post(':chatId/messages')
  async sendMessage(
    @Request() req,
    @Param('chatId') chatId: string,
    @Body() body: { content: string }
  ) {
    const userId = req.user.id;
    console.log(`📤 Usuario ${userId} enviando mensaje al chat ${chatId}: ${body.content}`);
    
    const message = await this.chatsService.sendMessage(chatId, userId, body.content);
    
    console.log(`✅ Mensaje guardado con ID: ${message.id}`);
    
    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt
    };
  }

  @Post(':chatId/test-message')
  async sendTestMessage(
    @Request() req,
    @Param('chatId') chatId: string
  ) {
    const userId = req.user.id;
    const testContent = `Mensaje de prueba enviado por ${req.user.name} a las ${new Date().toLocaleTimeString()}`;
    
    console.log(`🧪 Enviando mensaje de prueba: ${testContent}`);
    
    const message = await this.chatsService.sendMessage(chatId, userId, testContent);
    
    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt,
      success: true
    };
  }

  @Get(':chatId/messages')
  async getMessages(@Request() req, @Param('chatId') chatId: string) {
    const userId = req.user.id;
    const messages = await this.chatsService.getMessagesForChat(chatId, userId);
    
    return messages.map(message => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      createdAt: message.createdAt
    }));
  }
} 