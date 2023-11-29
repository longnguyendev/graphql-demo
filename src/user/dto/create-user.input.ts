import { InputType, Field } from '@nestjs/graphql';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  Matches,
  MaxDate,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '../entities/user.entity';
import { endOfDay } from 'date-fns';
import { IsVietnameseName } from '../vietnamese-name.decorator';

const regexEmail = /^[^*]*$/;

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail({}, { message: 'Enter valid email' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Matches(regexEmail, { message: 'Enter valid email' })
  email: string;

  @Field()
  @MinLength(2, { message: 'First name contains at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @IsVietnameseName({ message: 'Enter valid first name' })
  firstName: string;

  @Field()
  @MinLength(2, { message: 'Last name contains at least 2 characters' })
  @MaxLength(20, { message: 'Last name must not exceed 20 characters' })
  @IsVietnameseName({ message: 'Enter valid last name' })
  lastName: string;

  @Field()
  @MinLength(6, { message: 'Password contains at least 6 characters' })
  @MaxLength(255, { message: 'Password must not exceed 255 characters' })
  password: string;

  @Field(() => Gender)
  @IsEnum(Gender, { message: 'Enter valid Gendder' })
  gender: Gender;

  @Field()
  @IsDate({ message: 'Enter valid Birthday' })
  @MaxDate(endOfDay(new Date()), { message: 'Enter valid Birthday' })
  dob: Date;

  @Field({ nullable: true })
  @IsOptional()
  bio?: string;
}
