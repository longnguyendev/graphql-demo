import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class Timestamp implements CustomScalar<string | number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: string | number): Date {
    return new Date(value);
  }

  serialize(value: number | string | Date): number {
    if (typeof value === 'string') {
      return Date.parse(value);
    }

    if (value instanceof Date) {
      return value.getTime();
    }

    if (new Date(value).getTime() > 0) {
      return value;
    }

    throw new SyntaxError(`${value} is not a valid value to serialize`);
  }

  parseLiteral(ast: ValueNode): Date | null {
    switch (ast.kind) {
      case Kind.INT:
        return new Date(Number(ast.value));

      case Kind.STRING:
        return new Date(ast.value);

      default:
        return null;
    }
  }
}
