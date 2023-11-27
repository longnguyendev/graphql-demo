import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from './user.decorator';
import { UserService } from './user.service';
import { PaginatedUser } from './entities/paginated-user';
import { PaginationArgs } from 'src/common/args/pagination.args';
import { UpdateUserInput } from './dto/update-user.input';

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

  @Query(() => PaginatedUser)
  async usersNotMe(
    @CurrentUser('id') userId: number,
    @Args() paginationArgs: PaginationArgs,
    @Args('search', { defaultValue: '' }) search?: string,
  ) {
    return this.userService.getUsers(paginationArgs, userId, search);
  }

  @Mutation(() => User)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser('id') userId: number,
  ) {
    return this.userService.update(userId, updateUserInput);
  }
}
