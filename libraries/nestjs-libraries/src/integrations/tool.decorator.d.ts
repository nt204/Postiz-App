import 'reflect-metadata';
export declare function Tool(params: {
    description: string;
    dataSchema: Array<{
        key: string;
        type: string;
        description: string;
    }>;
}): (target: any, propertyKey: string | symbol) => void;
