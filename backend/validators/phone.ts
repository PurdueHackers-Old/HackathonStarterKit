import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
// import phone = require('phone');

export function IsPhoneNumber(locale?: string, validationOptions?: ValidationOptions) {
	return (object: object, propertyName: string) => {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [],
			validator: {
				validate(value: any, args: ValidationArguments) {
					return true;
					// return phone(value, locale).length > 0;
				}
			}
		});
	};
}
