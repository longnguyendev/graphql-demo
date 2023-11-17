import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Conversation } from './entities/conversation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationArgs } from 'src/common/args/pagination.args';
import { PaginatedConversation } from './entities/paginated-conversation';
import { cursorPagination } from 'src/common/utils/cursorPagination';

@Injectable()
export class ConversationService extends BaseService<Conversation> {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {
    super(conversationRepository);
  }

  async paginateConversation(
    paginationArgs: PaginationArgs,
    userId: string,
  ): Promise<PaginatedConversation> {
    const queryBuilder = this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'user', 'user.id = :userId', {
        userId,
      })
      .innerJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('conversation.lastMessage', 'lastMessage');

    return cursorPagination({ queryBuilder, paginationArgs });
  }
}
