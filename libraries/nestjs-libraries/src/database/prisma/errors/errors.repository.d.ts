import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
interface ListErrorsParams {
    page?: number;
    limit?: number;
    platform?: string;
    email?: string;
    unknownFirst?: boolean;
}
export declare class ErrorsRepository {
    private _errors;
    constructor(_errors: PrismaRepository<'errors'>);
    private buildWhere;
    private get include();
    listPlatforms(): Promise<string[]>;
    listErrors(params: ListErrorsParams): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
}
export {};
