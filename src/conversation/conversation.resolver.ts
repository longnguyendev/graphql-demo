import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ConversationService } from './conversation.service';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationInput } from './dto/create-conversation.input';
import { CurrentUser } from 'src/user/user.decorator';
import { UserService } from 'src/user/user.service';
import { PaginatedConversation } from './entities/paginated-conversation';
import { PaginationArgs } from 'src/common/args/pagination.args';
import { User } from 'src/user/entities/user.entity';
import { Inject, NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { PubSubEngine } from 'graphql-subscriptions';
import { CONVERSATION_CREATED_EVENT } from './conversation.constant';
import { In } from 'typeorm';

@Resolver(() => Conversation)
@UseGuards(JwtAuthGuard)
export class ConversationResolver {
  constructor(
    @Inject(PUB_SUB)
    private readonly pubSub: PubSubEngine,
    private readonly conversationService: ConversationService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => Conversation)
  async createConversation(
    @Args('createConversationInput')
    createConversationInput: CreateConversationInput,
    @CurrentUser() user: User,
  ) {
    const participants = await this.userService.findAll({
      queryBuilder: (qb) => {
        qb.where({ id: In(createConversationInput.participantIds) });
      },
    });

    const conversationCreated = await this.conversationService.create({
      ...createConversationInput,
      participants: [user, ...participants],
    });

    this.pubSub.publish(CONVERSATION_CREATED_EVENT, {
      conversationCreated,
    });

    return conversationCreated;
  }

  @Query(() => PaginatedConversation)
  conversations(
    @Args() paginationArgs: PaginationArgs,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationService.paginateConversation(
      paginationArgs,
      userId,
    );
  }

  @Query(() => Conversation)
  async conversation(
    @CurrentUser('id') userId: string,
    @Args('conversationId', { type: () => Number }) conversationId: number,
  ) {
    const data = await this.conversationService.findOne(conversationId, {
      queryBuilder: (qb) => {
        qb.innerJoin(`${qb.alias}.participants`, 'user', 'user.id = :userId', {
          userId,
        }).innerJoinAndSelect(`${qb.alias}.participants`, 'participants');
      },
    });

    if (!data) {
      throw new NotFoundException();
    }

    return data;
  }

  @Mutation(() => Conversation)
  removeConversation(@Args('id', { type: () => Number }) id: number) {
    return this.conversationService.remove(id);
  }

  @ResolveField(() => String)
  name(
    @Parent() conversation: Conversation,
    @CurrentUser('id') userId: number,
  ) {
    if (conversation?.name) {
      return conversation.name;
    }

    const participantNames = conversation.participants
      .filter((participant) => participant.id !== userId)
      .map((participant) => participant.lastName);

    const name = participantNames.slice(0, 3).join(', ');

    return participantNames.length > 3
      ? name + ` and +${participantNames.length - 3} others`
      : name;
  }

  @Subscription(() => Conversation, {
    async filter(this: ConversationResolver, payload, _, context) {
      const userId = context.req.user.id;

      const conversation = await this.conversationService.findOne(
        payload.conversationCreated.id,
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
      return Boolean(conversation);
    },
  })
  conversationCreated() {
    return this.pubSub.asyncIterator(CONVERSATION_CREATED_EVENT);
  }
}
