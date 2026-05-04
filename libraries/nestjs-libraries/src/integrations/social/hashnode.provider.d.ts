import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { HashnodeSettingsDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/hashnode.settings.dto';
import { Integration } from '@prisma/client';
export declare class HashnodeProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    editor: "markdown";
    maxLength(): number;
    dto: typeof HashnodeSettingsDto;
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
    tags(): Promise<{
        value: string;
        label: string;
    }[]>;
    tagsList(): ({
        name: string;
        logo: string;
        slug: string;
        objectID: string;
    } | {
        name: string;
        slug: string;
        objectID: string;
        logo?: undefined;
    } | {
        slug: string;
        objectID: string;
        name?: undefined;
        logo?: undefined;
    })[];
    publications(accessToken: string): Promise<any>;
    post(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
}
