import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateMessageInput {
  @Field()
  conversationId: number;

  @Field()
  content: string;
}
