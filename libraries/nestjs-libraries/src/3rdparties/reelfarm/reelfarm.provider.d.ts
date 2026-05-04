import { ThirdPartyAbstract } from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';
export declare class ReelFarmProvider extends ThirdPartyAbstract {
    checkConnection(apiKey: string): Promise<false | {
        name: string;
        username: string;
        id: string;
    }>;
    listMedia(apiKey: string, data?: {
        page?: number;
    }): Promise<{
        results: {
            id: string;
            url: string;
            thumbnail?: string;
            name: string;
            type: 'video' | 'image';
        }[];
        pages: number;
    }>;
    importMedia(apiKey: string, items: {
        url: string;
        name: string;
    }[]): Promise<{
        url: string;
        name: string;
    }[]>;
    sendData(): Promise<string>;
}
