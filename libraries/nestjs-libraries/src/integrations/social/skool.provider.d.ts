import { SocialAbstract } from '../social.abstract';
import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from './social.integrations.interface';
import { Integration } from '@prisma/client';
import { SkoolDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/skool.dto';
export declare class SkoolProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    isChromeExtension: boolean;
    scopes: string[];
    editor: "normal";
    dto: typeof SkoolDto;
    extensionCookies: {
        name: string;
        domain: string;
    }[];
    private getCookies;
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body' | 'retry';
        value: string;
    } | undefined;
    maxLength(): number;
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
    }): Promise<string | {
        refreshToken: string;
        expiresIn: number;
        accessToken: string;
        id: any;
        name: string;
        picture: any;
        username: any;
    }>;
    groups(accessToken: string, params: any, id: string, integration: Integration): Promise<any>;
    label(accessToken: string, params: any, id: string, integration: Integration): Promise<{
        id: string;
        name: any;
    }[]>;
    private uploadMediaToSkool;
    post(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
}
