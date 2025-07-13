import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatsService } from './chats.service';
import { UsersService } from '../users/users.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private chatsService: ChatsService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      console.log('🔌 Nueva conexión WebSocket intentando autenticarse...');
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        console.log('❌ No se encontró token, desconectando...');
        client.disconnect();
        return;
      }

      console.log('🔑 Verificando token...');
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        console.log('❌ Usuario no encontrado, desconectando...');
        client.disconnect();
        return;
      }

      client.userId = user.id;
      this.connectedUsers.set(user.id, client.id);
      
      console.log(`✅ Usuario conectado: ${user.name} (${user.id}) - Socket: ${client.id}`);
      console.log(`📊 Usuarios conectados: ${this.connectedUsers.size}`);
    } catch (error) {
      console.error('❌ Error en conexión WebSocket:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`❌ Usuario desconectado: ${client.userId}`);
      console.log(`📊 Usuarios conectados: ${this.connectedUsers.size}`);
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    console.log(`🔗 Usuario ${client.userId} intentando unirse al chat ${chatId}`);
    
    if (!client.userId) {
      console.log('❌ Usuario no autenticado para unirse al chat');
      return;
    }

    try {
      // Verificar que el usuario tiene acceso al chat
      await this.chatsService.getChatById(chatId, client.userId);
      
      // Unirse a la sala del chat
      client.join(`chat_${chatId}`);
      console.log(`✅ Usuario ${client.userId} se unió al chat ${chatId}`);
      
      // Enviar confirmación al cliente
      client.emit('chatJoined', { chatId, success: true });
    } catch (error) {
      console.error('❌ Error al unirse al chat:', error);
      client.emit('chatJoined', { chatId, success: false, error: error.message });
    }
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    console.log(`🚪 Usuario ${client.userId} saliendo del chat ${chatId}`);
    client.leave(`chat_${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; content: string },
  ) {
    console.log(`📤 Usuario ${client.userId} intentando enviar mensaje al chat ${data.chatId}: ${data.content}`);
    
    if (!client.userId) {
      console.log('❌ Usuario no autenticado para enviar mensaje');
      return;
    }

    try {
      // Guardar el mensaje en la base de datos
      console.log('💾 Guardando mensaje en la base de datos...');
      const message = await this.chatsService.sendMessage(
        data.chatId,
        client.userId,
        data.content,
      );
      console.log('✅ Mensaje guardado:', message.id);

      // Obtener el chat completo para enviar la información del otro usuario
      const chat = await this.chatsService.getChatById(data.chatId, client.userId);
      const otherUser = chat.match.user1Id === client.userId ? chat.match.user2 : chat.match.user1;

      // Preparar el mensaje para enviar
      const messageToSend = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: chat.match.user1Id === client.userId ? chat.match.user1.name : chat.match.user2.name,
        createdAt: message.createdAt,
        chatId: data.chatId,
      };

      console.log('📨 Enviando mensaje a la sala del chat...');
      // Enviar el mensaje a todos en la sala del chat
      this.server.to(`chat_${data.chatId}`).emit('newMessage', messageToSend);

      // Enviar notificación al otro usuario si está conectado
      const otherUserSocketId = this.connectedUsers.get(otherUser.id);
      if (otherUserSocketId) {
        console.log(`🔔 Enviando notificación al usuario ${otherUser.id}`);
        this.server.to(otherUserSocketId).emit('messageNotification', {
          chatId: data.chatId,
          message: messageToSend,
          senderName: messageToSend.senderName,
        });
      } else {
        console.log(`ℹ️ Usuario ${otherUser.id} no está conectado para notificación`);
      }

      console.log(`✅ Mensaje enviado exitosamente en chat ${data.chatId}: ${data.content}`);
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      client.emit('messageError', { error: 'Error al enviar mensaje: ' + error.message });
    }
  }

  // Método para enviar mensajes desde el servidor (útil para notificaciones)
  sendMessageToChat(chatId: string, message: any) {
    console.log(`📨 Enviando mensaje del servidor al chat ${chatId}`);
    this.server.to(`chat_${chatId}`).emit('newMessage', message);
  }

  // Método para enviar notificación a un usuario específico
  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      console.log(`🔔 Enviando notificación al usuario ${userId}`);
      this.server.to(socketId).emit('notification', notification);
    } else {
      console.log(`ℹ️ Usuario ${userId} no está conectado para notificación`);
    }
  }
} 