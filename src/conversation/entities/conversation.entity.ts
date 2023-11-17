import { ObjectType, Field } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';

@ObjectType()
@Entity()
export class Conversation extends BaseEntity {
  @Column({ nullable: true })
  name?: string;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.conversations)
  @JoinTable()
  participants: User[];

  @Field(() => [Message])
  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @Field(() => Message, { nullable: true })
  @OneToOne(() => Message, {
    nullable: true,
  })
  @JoinColumn()
  lastMessage?: Message;
}
