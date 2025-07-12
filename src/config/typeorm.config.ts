import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: 'localhost',
  port: parseInt('5432'),
  username: 'postgres',
  password: '8426951',
  database: 'ontomatch',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
});