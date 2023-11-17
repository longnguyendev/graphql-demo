import { CreateMessageInput } from './create-message.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateMessageInput extends PartialType(CreateMessageInput) {
  @Field()
  id: number;
}
