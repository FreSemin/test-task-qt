import { ValidationOptions, registerDecorator, ValidationArguments } from 'class-validator';

export function IsRepeated(property: string, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isRepeated',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: string, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;

                    const sourceObject = args.object;

                    if (!sourceObject.hasOwnProperty(relatedPropertyName)) {
                        return false;
                    }

                    const relatedValue = (args.object as any)[relatedPropertyName];

                    return value === relatedValue;
                },

                defaultMessage(): string {
                    return `${propertyName} needs to be identical to ${property}`;
                },
            },
        });
    };
}
