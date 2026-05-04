import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
import { MeweDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/mewe.dto';
export declare class MeweProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    editor: "normal";
    dto: typeof MeweDto;
    private get meweHost();
    private authHeaders;
    maxLength(): number;
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body' | 'retry';
        value: string;
    } | undefined;
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
    }): Promise<"No login request token received. Please try again." | "Failed to exchange token. Please try again." | "Login request is still pending. Please approve on MeWe and try again." | "No API token received. Please try again." | "Failed to fetch MeWe profile." | "MeWe authentication failed. Please try again." | {
        id: any;
        name: any;
        accessToken: any;
        refreshToken: string;
        expiresIn: number;
        picture: string;
        username: any;
    }>;
    groups(accessToken: string, params: any, id: string, integration: Integration): Promise<{
        id: string;
        name: any;
    }[]>;
    private uploadPhoto;
    post(id: string, accessToken: string, postDetails: PostDetails<MeweDto>[], integration: Integration): Promise<PostResponse[]>;
}
