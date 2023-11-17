import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isVietnameseName', async: false })
export class IsVietnameseNameConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string) {
    // Use a regex to check if the name contains only Vietnamese characters
    const regex = /^[\p{L}\s]+$/u;
    return regex.test(value);
  }

  defaultMessage() {
    return 'Name should only contain Vietnamese characters and spaces';
  }
}

export function IsVietnameseName(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsVietnameseNameConstraint,
    });
  };
}
