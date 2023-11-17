import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class PaginationArgs {
  @Field({ nullable: true })
  first?: number;

  @Field({ nullable: true })
  after?: string;
}
