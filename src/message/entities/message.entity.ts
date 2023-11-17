import { ObjectType, Field } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Conversation } from 'src/conversation/entities/conversation.entity';

@ObjectType()
@Entity()
export class Message extends BaseEntity {
  @ManyToOne(() => User, (user) => user.messages)
  @Field(() => User)
  sender: User;

  @Column()
  @Field()
  content: string;

  @Field(() => Conversation)
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;
}
