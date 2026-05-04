import { Integration } from '@prisma/client';
import { ApplicationFailure } from '@temporalio/activity';
export declare class RefreshToken extends ApplicationFailure {
    constructor(identifier: string, json: string, body: BodyInit, message?: string);
}
export declare class BadBody extends ApplicationFailure {
    constructor(identifier: string, json: string, body: BodyInit, message?: string);
}
export declare class NotEnoughScopes {
    message: string;
    constructor(message?: string);
}
export declare abstract class SocialAbstract {
    abstract identifier: string;
    maxConcurrentJob: number;
    handleErrors(body: string, status: number): {
        type: 'refresh-token' | 'bad-body' | 'retry';
        value: string;
    } | undefined;
    mention(token: string, d: {
        query: string;
    }, id: string, integration: Integration): Promise<{
        id: string;
        label: string;
        image: string;
        doNotCache?: boolean;
    }[] | {
        none: true;
    }>;
    runInConcurrent<T>(func: (...args: any[]) => Promise<T>, ignoreConcurrency?: boolean): Promise<any>;
    fetch(url: string, options?: RequestInit, identifier?: string, totalRetries?: number, ignoreConcurrency?: boolean): Promise<Response>;
    checkScopes(required: string[], got: string | string[]): boolean;
}
