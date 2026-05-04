import { AnalyticsData, AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
export declare class ThreadsProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    maxConcurrentJob: number;
    refreshCron: boolean;
    editor: "normal";
    maxLength(): number;
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body';
        value: string;
    } | undefined;
    refreshToken(refresh_token: string): Promise<AuthTokenDetails>;
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
        id: any;
        name: any;
        accessToken: any;
        refreshToken: any;
        expiresIn: number;
        picture: any;
        username: any;
    }>;
    private checkLoaded;
    private fetchUserInfo;
    private createSingleMediaContent;
    private createCarouselContent;
    private createTextContent;
    private publishThread;
    private createThreadContent;
    post(userId: string, accessToken: string, postDetails: PostDetails<{
        active_thread_finisher: boolean;
        thread_finisher: string;
    }>[]): Promise<PostResponse[]>;
    comment(userId: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails<{
        active_thread_finisher: boolean;
        thread_finisher: string;
    }>[], integration: Integration): Promise<PostResponse[]>;
    analytics(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
    autoPlugPost(integration: Integration, id: string, fields: {
        likesAmount: string;
        post: string;
    }): Promise<boolean>;
    postAnalytics(integrationId: string, accessToken: string, postId: string, date: number): Promise<AnalyticsData[]>;
}
