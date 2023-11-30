import { InputType, Field } from '@nestjs/graphql';
import { ArrayMinSize, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class CreateConversationInput {
  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(50, { message: 'group name must not exceed 50 characters' })
  name?: string;

  @Field(() => [Number])
  @ArrayMinSize(3, { message: 'choose more 3 to add new group' })
  participantIds: number[];
}
