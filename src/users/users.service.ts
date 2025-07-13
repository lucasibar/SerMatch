import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  findAllExcept(excludeId: string) {
    return this.repo.find({
      where: { id: Not(excludeId) },
      order: { createdAt: 'DESC' }
    });
  }
} 