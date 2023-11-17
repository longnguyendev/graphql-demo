import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('db.host', 'db'),
        port: configService.get<number>('db.port', 5432),
        username: configService.get<string>('db.user', 'admin'),
        password: configService.get<string>('db.password', 'admin'),
        database: configService.get<string>('db.database', 'graphql-demo'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
