import { Type } from 'class-transformer';
import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  NotEquals,
} from 'class-validator';
import { IsNullable, IsPassword, IsUndefinable } from './validator.decorators';
import {
  PhoneNumberSerializer,
  ToLowerCase,
  ToUpperCase,
} from './transform.decorators';
import { applyDecorators } from '@nestjs/common';

interface IFieldOptions {
  each?: boolean;
  swagger?: boolean;
  nullable?: boolean;
  groups?: string[];
  required?: boolean;
}

interface IStringFieldOptions extends IFieldOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  required?: boolean;
}

export function StringField(
  options: IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => String), IsString({ each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  const minLength = options.minLength || 1;

  decorators.push(MinLength(minLength, { each: options.each }));

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength, { each: options.each }));
  }

  if (options.toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (options.toUpperCase) {
    decorators.push(ToUpperCase());
  }

  return applyDecorators(...decorators);
}

export function EmailField(
  options: IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    IsEmail(),
    StringField({ toLowerCase: true, ...options }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  return applyDecorators(...decorators);
}

export function PasswordField(
  options: IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [StringField({ ...options, minLength: 6 }), IsPassword()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  return applyDecorators(...decorators);
}

export function PasswordFieldOptional(
  options: IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    PasswordField({ required: false, ...options }),
  );
}

export function PhoneField(options: IFieldOptions = {}): PropertyDecorator {
  const decorators = [IsPhoneNumber(), PhoneNumberSerializer()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  return applyDecorators(...decorators);
}

export function PhoneFieldOptional(
  options: IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    PhoneField({ required: false, ...options }),
  );
}
