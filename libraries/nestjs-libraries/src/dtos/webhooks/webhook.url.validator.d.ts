import { ValidationArguments, ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
export declare function isBlockedIPv4(ip: string): boolean;
export declare function isBlockedIPv6(ip: string): boolean;
export declare function isBlockedIp(ip: string): boolean;
export declare function isSafePublicHttpsUrl(value: unknown): Promise<boolean>;
export declare class IsSafeWebhookUrlConstraint implements ValidatorConstraintInterface {
    validate(value: unknown, _args: ValidationArguments): Promise<boolean>;
    defaultMessage(_args: ValidationArguments): string;
}
export declare function IsSafeWebhookUrl(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
