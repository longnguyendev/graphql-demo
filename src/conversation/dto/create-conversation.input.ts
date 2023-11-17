import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateConversationInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => [Number])
  participantIds: number[];
}
