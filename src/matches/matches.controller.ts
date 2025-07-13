import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MatchesService } from './matches.service';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Post('like/:userId')
  async likeUser(@Request() req, @Param('userId') targetUserId: string) {
    const currentUserId = req.user.id;
    const result = await this.matchesService.likeUser(currentUserId, targetUserId);
    
    return {
      success: true,
      isMatch: result.isMatch,
      message: result.isMatch ? '¡Es un match! 🎉' : 'Like enviado'
    };
  }

  @Get('my-matches')
  async getMyMatches(@Request() req) {
    const userId = req.user.id;
    const matches = await this.matchesService.getMatchesForUser(userId);
    
    // Formatear respuesta para el frontend
    return matches.map(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      return {
        id: match.id,
        user: {
          id: otherUser.id,
          name: otherUser.name,
          profilePhoto: otherUser.profilePhoto,
          bio: otherUser.bio,
          lookingFor: otherUser.lookingFor
        },
        createdAt: match.createdAt
      };
    });
  }

  @Get('my-likes')
  async getMyLikes(@Request() req) {
    const userId = req.user.id;
    const likes = await this.matchesService.getLikesForUser(userId);
    
    // Formatear respuesta para el frontend
    return likes.map(like => {
      const otherUser = like.user1Id === userId ? like.user2 : like.user1;
      return {
        id: like.id,
        user: {
          id: otherUser.id,
          name: otherUser.name,
          profilePhoto: otherUser.profilePhoto,
          bio: otherUser.bio,
          lookingFor: otherUser.lookingFor
        },
        createdAt: like.createdAt
      };
    });
  }
} 