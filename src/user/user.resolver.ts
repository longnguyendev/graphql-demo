import { Resolver, Query, ResolveField, Parent, Args } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from './user.decorator';
import { UserService } from './user.service';
import { PaginatedUser } from './entities/paginated-user';
import { PaginationArgs } from 'src/common/args/pagination.args';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Query(() => PaginatedUser)
  async users(
    @CurrentUser('id') userId: number,
    @Args() paginationArgs: PaginationArgs,
    @Args('search', { defaultValue: '' }) search?: string,
  ) {
    return this.userService.paginateUser(paginationArgs, userId, search);
  }

  @ResolveField(() => String)
  name(@Parent() user: User) {
    const { firstName, lastName } = user;
    return `${firstName} ${lastName}`;
  }
}