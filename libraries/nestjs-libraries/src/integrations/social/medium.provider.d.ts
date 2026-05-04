import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
import { MediumSettingsDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/medium.settings.dto';
export declare class MediumProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    editor: "markdown";
    dto: typeof MediumSettingsDto;
    maxLength(): number;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    refreshToken(refreshToken: string): Promise<AuthTokenDetails>;
    customFields(): Promise<{
        key: string;
        label: string;
        validation: string;
        type: "password";
    }[]>;
    authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<"Invalid credentials" | {
        refreshToken: string;
        expiresIn: number;
        accessToken: any;
        id: any;
        name: any;
        picture: any;
        username: any;
    }>;
    publications(accessToken: string, _: any, id: string): Promise<any>;
    post(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
}
