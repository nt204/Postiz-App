import { SocialAbstract } from '../social.abstract';
import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from './social.integrations.interface';
import { Integration } from '@prisma/client';
import { ListmonkDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/listmonk.dto';
export declare class ListmonkProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    editor: "html";
    dto: typeof ListmonkDto;
    maxLength(): number;
    customFields(): Promise<({
        key: string;
        label: string;
        defaultValue: string;
        validation: string;
        type: "text";
    } | {
        key: string;
        label: string;
        validation: string;
        type: "text";
        defaultValue?: undefined;
    } | {
        key: string;
        label: string;
        validation: string;
        type: "password";
        defaultValue?: undefined;
    })[]>;
    refreshToken(refreshToken: string): Promise<AuthTokenDetails>;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<"Invalid credentials" | {
        refreshToken: string;
        expiresIn: number;
        accessToken: string;
        id: string;
        name: any;
        picture: any;
        username: any;
    }>;
    list(token: string, data: any, internalId: string, integration: Integration): Promise<any>;
    templates(token: string, data: any, internalId: string, integration: Integration): Promise<any[]>;
    post(id: string, accessToken: string, postDetails: PostDetails<ListmonkDto>[], integration: Integration): Promise<PostResponse[]>;
}
