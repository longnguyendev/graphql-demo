import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './gql-auth.guard';
import { LoginInput } from './dto/login.dto';
import { Auth } from './entities/auth.entity';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import { CurrentUser } from 'src/user/user.decorator';
import { User } from 'src/user/entities/user.entity';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Auth)
  @UseGuards(GqlAuthGuard)
  async login(
    @Args('loginInput') _loginInput: LoginInput,
    @CurrentUser() user: User,
  ) {
    return this.authService.login(user);
  }

  @Mutation(() => Auth)
  async signUp(@Args('signUpInput') createUserInput: CreateUserInput) {
    return this.authService.signUp({
      ...createUserInput,
      email: createUserInput.email.toLowerCase(),
      firstName: createUserInput.firstName.trim(),
      lastName: createUserInput.lastName.trim(),
    });
  }
}
