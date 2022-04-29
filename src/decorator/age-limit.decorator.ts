import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export function IsOlderThan(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: AgeConstraint,
        });
    };
}

@ValidatorConstraint({ name: 'IsOlderThan', async: true })
export class AgeConstraint implements ValidatorConstraintInterface {
    validate(dateValue: string, _args: ValidationArguments) {
        const parsedBirthDate = new Date(dateValue);
        let age = new Date().getFullYear() - parsedBirthDate.getFullYear();
        const month = new Date().getMonth() - parsedBirthDate.getMonth();
        if (month < 0 || (month === 0 && new Date().getDate() < new Date().getDate())) {
            --age;
        }
        return age >= 16;
    }

    defaultMessage() {
        return `Must be at least 16 years old to register!`
    }
}