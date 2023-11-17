import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { CreateMessageInput } from './dto/create-message.input';
import { CurrentUser } from 'src/user/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { PaginatedMessage } from './entities/paginated-message';
import { PaginationArgs } from 'src/common/args/pagination.args';
import { Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ConversationService } from 'src/conversation/conversation.service';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { PubSub } from 'graphql-subscriptions';
import { MESSAGE_CREATED_EVENT } from './message.constant';

@Resolver(() => Message)
@UseGuards(JwtAuthGuard)
export class MessageResolver {
  constructor(
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
  ) {}

  @Mutation(() => Message)
  async createMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @CurrentUser() sender: User,
  ) {
    const conversation = await this.conversationService.findOneOrFail(
      createMessageInput.conversationId,
      {
        queryBuilder: (qb) => {
          qb.innerJoin(
            `${qb.alias}.participants`,
            'user',
            'user.id = :userId',
            { userId: sender.id },
          );
        },
      },
    );

    const messageCreated = await this.messageService.create({
      ...createMessageInput,
      content: createMessageInput.content.trim(),
      conversation,
      sender,
    });

    this.conversationService.update(conversation.id, {
      lastMessage: messageCreated,
    });

    this.pubSub.publish(MESSAGE_CREATED_EVENT, {
      messageCreated,
    });

    return messageCreated;
  }

  @Query(() => PaginatedMessage)
  messages(
    @CurrentUser('id') userId: number,
    @Args() paginationArgs: PaginationArgs,
    @Args('conversationId', { type: () => Number })
    conversationId: number,
  ) {
    return this.messageService.paginateMessage(
      paginationArgs,
      userId,
      conversationId,
    );
  }

  @Query(() => Message)
  message(@Args('id', { type: () => Number }) id: number) {
    return this.messageService.findOneOrFail(id);
  }

  @Mutation(() => Message)
  removeMessage(@Args('id', { type: () => Number }) id: number) {
    return this.messageService.remove(id);
  }

  @Subscription(() => Message, {
    async filter(this: MessageResolver, payload, variables, context) {
      const userId = context.req.user.id;

      const conversation = await this.conversationService.findOne(
        payload.messageCreated.conversation.id,
        {
          queryBuilder: (qb) => {
            qb.innerJoin(
              `${qb.alias}.participants`,
              'user',
              'user.id = :userId',
              { userId },
            );
          },
        },
      );

      return (
        conversation &&
        (!variables.conversationId ||
          variables.conversationId === conversation.id)
      );
    },
  })
  messageCreated(
    @Args('conversationId', { type: () => Number, nullable: true }) // eslint-disable-next-line @typescript-eslint/no-unused-vars
    conversationId?: number,
  ) {
    return this.pubSub.asyncIterator(MESSAGE_CREATED_EVENT);
  }
}
