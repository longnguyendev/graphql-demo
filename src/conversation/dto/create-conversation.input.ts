import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, MaxLength } from 'class-validator';

@InputType()
export class CreateConversationInput {
  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(50, { message: 'group name must not exceed 50 characters' })
  name?: string;

  @Field(() => [Number])
  participantIds: number[];
}
