type Ctx = {
    requestId: string;
    auth: any;
};
export declare function runWithContext<T>(ctx: Ctx, fn: () => Promise<T> | T): T | Promise<T>;
export declare function getContext(): Ctx | undefined;
export declare function getAuth<T = any>(): T | undefined;
export declare function getRequestId(): string | undefined;
export {};
