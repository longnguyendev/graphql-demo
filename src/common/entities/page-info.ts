import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
  @Field({ nullable: true })
  cursor: string;

  @Field()
  hasNextPage: boolean;
}
