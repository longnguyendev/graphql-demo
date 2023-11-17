import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Message } from 'src/message/entities/message.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

export enum Gender {
  Other,
  Male,
  Female,
}

registerEnumType(Gender, {
  name: 'Gender',
});

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  @IsEmail()
  @Field()
  email: string;

  @Column()
  @Field()
  firstName: string;

  @Column()
  @Field()
  lastName: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.Other,
  })
  @Field(() => Gender)
  gender: Gender;

  @Column({
    type: 'date',
  })
  @Field()
  dob: Date;

  @Column()
  @MinLength(6)
  password: string;

  @ManyToMany(() => Conversation, (conversation) => conversation.participants, {
    nullable: true,
  })
  conversations?: Conversation[];

  @OneToMany(() => Message, (message) => message.sender, { nullable: true })
  messages?: Message[];
}
