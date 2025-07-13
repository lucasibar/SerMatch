import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'supersecret',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
} 