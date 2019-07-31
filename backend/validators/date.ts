import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsDate(validationOptions?: ValidationOptions) {
	return (object: object, propertyName: string) => {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [],
			validator: {
				validate(value: any, args: ValidationArguments) {
					return isFinite(Date.parse(value));
				}
			}
		});
	};
}
