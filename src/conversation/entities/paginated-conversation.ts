import { ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/common/entities/paginated';
import { Conversation } from './conversation.entity';

@ObjectType()
export class PaginatedConversation extends Paginated(Conversation) {}
