import { CreateConversationInput } from './create-conversation.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateConversationInput extends PartialType(
  CreateConversationInput,
) {
  @Field()
  id: number;
}
