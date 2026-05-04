import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
import { TwitchDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/twitch.dto';
export declare class TwitchProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    editor: "normal";
    scopes: string[];
    dto: typeof TwitchDto;
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
    }): Promise<{
        id: string;
        name: string;
        accessToken: any;
        refreshToken: any;
        expiresIn: any;
        picture: string;
        username: string;
    }>;
    private getUserInfo;
    private sendAnnouncement;
    private sendChatMessage;
    post(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
}
