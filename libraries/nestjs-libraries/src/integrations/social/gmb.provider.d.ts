import { AnalyticsData, AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { GmbSettingsDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/gmb.settings.dto';
export declare class GmbProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    editor: "normal";
    dto: typeof GmbSettingsDto;
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
        accessToken: string;
        expiresIn: number;
        refreshToken: string;
        id: string;
        name: string;
        picture: string;
        username: string;
    }>;
    pages(accessToken: string): Promise<{
        id: string;
        name: string;
        picture: {
            data: {
                url: string;
            };
        };
        accountName: string;
        locationName: string;
    }[]>;
    fetchPageInformation(accessToken: string, data: {
        id: string;
        accountName: string;
        locationName: string;
    }): Promise<{
        id: string;
        name: any;
        access_token: string;
        picture: string;
        username: string;
    }>;
    reConnect(id: string, requiredId: string, accessToken: string): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>>;
    post(id: string, accessToken: string, postDetails: PostDetails<GmbSettingsDto>[]): Promise<PostResponse[]>;
    private formatDate;
    private formatTime;
    analytics(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
    postAnalytics(integrationId: string, accessToken: string, postId: string, date: number): Promise<AnalyticsData[]>;
}
