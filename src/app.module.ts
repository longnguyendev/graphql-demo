import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { validate } from 'env.validation';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { Timestamp } from './common/scalars/timestamp.scalar';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { DatabaseModule } from './database/database.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validate,
    }),
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
      context: (context: any) => ({
        req: context.connectionParams ? context.connectionParams : context?.req,
        res: context?.res,
      }),
      subscriptions: {
        'graphql-ws': {
          path: '/graphql',
        },
      },
    }),
    AuthModule,
    UserModule,
    PubSubModule,
    ConversationModule,
    MessageModule,
  ],
  providers: [Timestamp],
})
export class AppModule {}
