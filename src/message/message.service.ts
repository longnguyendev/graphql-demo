import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Message } from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationArgs } from 'src/common/args/pagination.args';
import { PaginatedMessage } from './entities/paginated-message';
import { cursorPagination } from 'src/common/utils/cursorPagination';

@Injectable()
export class MessageService extends BaseService<Message> {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {
    super(messageRepository);
  }

  async paginateMessage(
    paginationArgs: PaginationArgs,
    userId: number,
    conversationId: number,
  ): Promise<PaginatedMessage> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .innerJoinAndSelect(
        'message.conversation',
        'conversation',
        'message.conversationId = :conversationId',
        {
          conversationId,
        },
      )
      .innerJoin('conversation.participants', 'user', 'user.id = :userId', {
        userId,
      })
      .innerJoinAndSelect('message.sender', 'sender');

    return cursorPagination({ queryBuilder, paginationArgs });
  }
}
