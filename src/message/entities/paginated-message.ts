import { ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/common/entities/paginated';
import { Message } from './message.entity';

@ObjectType()
export class PaginatedMessage extends Paginated(Message) {}
