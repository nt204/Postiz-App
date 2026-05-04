import { ErrorsRepository } from '@gitroom/nestjs-libraries/database/prisma/errors/errors.repository';
export declare class ErrorsService {
    private _errorsRepository;
    constructor(_errorsRepository: ErrorsRepository);
    listErrors(params: {
        page?: number;
        limit?: number;
        platform?: string;
        email?: string;
        unknownFirst?: boolean;
    }): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
    listPlatforms(): Promise<string[]>;
}
