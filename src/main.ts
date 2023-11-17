import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  const port = configService.get<number>('port', 3000);

  await app.listen(port);

  logger.log(`🚀 Server running on http://localhost:${port}/graphql`);
}

bootstrap();
