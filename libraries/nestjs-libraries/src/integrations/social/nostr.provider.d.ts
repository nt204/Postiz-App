import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
export declare class NostrProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    editor: "normal";
    toolTip: string;
    maxLength(): number;
    customFields(): Promise<{
        key: string;
        label: string;
        validation: string;
        type: "password";
    }[]>;
    refreshToken(refresh_token: string): Promise<AuthTokenDetails>;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    private findRelayInformation;
    private publish;
    authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<"Invalid credentials" | {
        id: string;
        name: any;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        picture: any;
        username: any;
    }>;
    private buildContent;
    post(id: string, accessToken: string, postDetails: PostDetails[]): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
}
