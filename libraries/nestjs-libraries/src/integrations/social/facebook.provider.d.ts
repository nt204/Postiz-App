import { AnalyticsData, AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { FacebookDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/facebook.dto';
import { Integration } from '@prisma/client';
export declare class FacebookProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    maxConcurrentJob: number;
    editor: "normal";
    maxLength(): number;
    dto: typeof FacebookDto;
    handleErrors(body: string, status: number): {
        type: 'refresh-token' | 'bad-body';
        value: string;
    } | undefined;
    refreshToken(refresh_token: string): Promise<AuthTokenDetails>;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    reConnect(id: string, requiredId: string, accessToken: string): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>>;
    authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<{
        id: any;
        name: any;
        accessToken: any;
        refreshToken: any;
        expiresIn: number;
        picture: any;
        username: string;
    }>;
    pages(accessToken: string): Promise<any[]>;
    fetchPageInformation(accessToken: string, data: {
        page: string;
    }): Promise<{
        id: any;
        name: any;
        access_token: any;
        picture: any;
        username: any;
    }>;
    post(id: string, accessToken: string, postDetails: PostDetails<FacebookDto>[]): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails<FacebookDto>[], integration: Integration): Promise<PostResponse[]>;
    analytics(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
    postAnalytics(integrationId: string, accessToken: string, postId: string, date: number): Promise<AnalyticsData[]>;
}
