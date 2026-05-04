import { OnModuleInit } from '@nestjs/common';
import { TemporalService } from 'nestjs-temporal-core';
export declare class TemporalRegister implements OnModuleInit {
    private _client;
    constructor(_client: TemporalService);
    onModuleInit(): Promise<void>;
}
export declare class TemporalRegisterMissingSearchAttributesModule {
}
