import { Integration } from '@prisma/client';
export interface ClientInformation {
    client_id: string;
    client_secret: string;
    instanceUrl: string;
}
export interface IAuthenticator {
    authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }, clientInformation?: ClientInformation): Promise<AuthTokenDetails | string>;
    refreshToken(refreshToken: string): Promise<AuthTokenDetails>;
    reConnect?(id: string, requiredId: string, accessToken: string): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>>;
    generateAuthUrl(clientInformation?: ClientInformation): Promise<GenerateAuthUrlResponse>;
    analytics?(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
    postAnalytics?(integrationId: string, accessToken: string, postId: string, fromDate: number): Promise<AnalyticsData[]>;
    changeNickname?(id: string, accessToken: string, name: string): Promise<{
        name: string;
    }>;
    changeProfilePicture?(id: string, accessToken: string, url: string): Promise<{
        url: string;
    }>;
    missing?(id: string, accessToken: string): Promise<{
        id: string;
        url: string;
    }[]>;
}
export interface AnalyticsData {
    label: string;
    data: Array<{
        total: string;
        date: string;
    }>;
    percentageChange: number;
}
export type GenerateAuthUrlResponse = {
    url: string;
    codeVerifier: string;
    state: string;
};
export type AuthTokenDetails = {
    id: string;
    name: string;
    error?: string;
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    picture?: string;
    username: string;
    additionalSettings?: {
        title: string;
        description: string;
        type: 'checkbox' | 'text' | 'textarea';
        value: any;
        regex?: string;
    }[];
};
export interface ISocialMediaIntegration {
    post(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
    comment?(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
}
export type PostResponse = {
    id: string;
    postId: string;
    releaseURL: string;
    status: string;
};
export type PostDetails<T = any> = {
    id: string;
    message: string;
    settings: T;
    media?: MediaContent[];
    poll?: PollDetails;
};
export type PollDetails = {
    options: string[];
    duration: number;
};
export type MediaContent = {
    type: 'image' | 'video';
    path: string;
    alt?: string;
    thumbnail?: string;
    thumbnailTimestamp?: number;
};
export type FetchPageInformationResult = {
    id: string;
    name: string;
    access_token: string;
    picture: string;
    username: string;
};
export interface SocialProvider extends IAuthenticator, ISocialMediaIntegration {
    identifier: string;
    refreshWait?: boolean;
    convertToJPEG?: boolean;
    refreshCron?: boolean;
    dto?: any;
    maxLength: (additionalSettings?: any) => number;
    isWeb3?: boolean;
    isChromeExtension?: boolean;
    extensionCookies?: {
        name: string;
        domain: string;
    }[];
    editor: 'none' | 'normal' | 'markdown' | 'html';
    customFields?: () => Promise<{
        key: string;
        label: string;
        defaultValue?: string;
        validation: string;
        type: 'text' | 'password';
    }[]>;
    name: string;
    toolTip?: string;
    oneTimeToken?: boolean;
    isBetweenSteps: boolean;
    scopes: string[];
    externalUrl?: (url: string) => Promise<{
        client_id: string;
        client_secret: string;
    }>;
    mention?: (token: string, data: {
        query: string;
    }, id: string, integration: Integration) => Promise<{
        id: string;
        label: string;
        image: string;
        doNotCache?: boolean;
    }[] | {
        none: true;
    }>;
    mentionFormat?(idOrHandle: string, name: string): string;
    fetchPageInformation?(accessToken: string, data: any): Promise<FetchPageInformationResult>;
}
