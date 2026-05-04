import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { WhopDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/whop.dto';
import { Integration } from '@prisma/client';
export declare class WhopProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    refreshCron: boolean;
    editor: "markdown";
    dto: typeof WhopDto;
    toolTip: string;
    maxLength(): number;
    private generateCodeChallenge;
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body';
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
    }): Promise<string | {
        id: any;
        name: any;
        accessToken: any;
        refreshToken: any;
        expiresIn: any;
        picture: any;
        username: any;
    }>;
    companies(accessToken: string, params: any, id: string): Promise<any>;
    experiences(accessToken: string, params: any, id: string): Promise<any>;
    private uploadMediaToWhop;
    post(id: string, accessToken: string, postDetails: PostDetails<WhopDto>[], integration: Integration): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails<WhopDto>[], integration: Integration): Promise<PostResponse[]>;
}
