import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('matches')
  async getPotentialMatches(@Request() req) {
    const currentUserId = req.user.id;
    const users = await this.usersService.findAllExcept(currentUserId);
    
    // Excluir información sensible como email y password
    return users.map(user => ({
      id: user.id,
      name: user.name,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      lookingFor: user.lookingFor,
      createdAt: user.createdAt
    }));
  }
}
