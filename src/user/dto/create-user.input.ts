import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsEnum, MinLength } from 'class-validator';
import { Gender } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field(() => Gender)
  @IsEnum(Gender)
  gender: Gender;

  @Field()
  dob: Date;
}
