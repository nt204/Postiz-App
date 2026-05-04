import { OnModuleInit } from '@nestjs/common';
import { TemporalService } from 'nestjs-temporal-core';
export declare class InfiniteWorkflowRegister implements OnModuleInit {
    private _temporalService;
    constructor(_temporalService: TemporalService);
    onModuleInit(): Promise<void>;
}
export declare class InfiniteWorkflowRegisterModule {
}
