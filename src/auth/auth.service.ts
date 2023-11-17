import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/entities/user.entity';
import { Payload } from './auth.interface';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if (user) {
      const match = await this.comparePassword(password, user.password);

      if (match) {
        return user;
      }
    }

    return null;
  }

  async comparePassword(attempt: string, password: string): Promise<boolean> {
    return bcrypt.compare(attempt, password);
  }

  async login(user: User): Promise<Auth> {
    const { id } = user;

    const payload: Payload = {
      sub: id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }

  async signUp(createUserDto: CreateUserInput): Promise<Auth> {
    const user = await this.userService.findByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException('User already exists');
    }

    const createdUser = await this.userService.create(createUserDto);

    return this.login(createdUser);
  }
}
