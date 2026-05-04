import { OAuthRepository } from '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.repository';
import { CreateOAuthAppDto } from '@gitroom/nestjs-libraries/dtos/oauth/create-oauth-app.dto';
import { UpdateOAuthAppDto } from '@gitroom/nestjs-libraries/dtos/oauth/update-oauth-app.dto';
export declare class OAuthService {
    private _oauthRepository;
    constructor(_oauthRepository: OAuthRepository);
    getApp(orgId: string): Promise<false | {
        picture: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            originalName: string | null;
            path: string;
            fileSize: number;
            type: string;
            thumbnail: string | null;
            alt: string | null;
            thumbnailTimestamp: number | null;
        };
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        pictureId: string | null;
        redirectUrl: string;
        clientId: string;
    }>;
    createApp(orgId: string, dto: CreateOAuthAppDto): Promise<{
        clientSecret: string;
        picture: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            originalName: string | null;
            path: string;
            fileSize: number;
            type: string;
            thumbnail: string | null;
            alt: string | null;
            thumbnailTimestamp: number | null;
        };
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        pictureId: string | null;
        redirectUrl: string;
        clientId: string;
    }>;
    updateApp(orgId: string, dto: UpdateOAuthAppDto): Promise<{
        picture: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            originalName: string | null;
            path: string;
            fileSize: number;
            type: string;
            thumbnail: string | null;
            alt: string | null;
            thumbnailTimestamp: number | null;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        pictureId: string | null;
        redirectUrl: string;
        clientId: string;
        clientSecret: string;
    }>;
    deleteApp(orgId: string): Promise<{
        success: boolean;
    }>;
    rotateSecret(orgId: string): Promise<{
        clientSecret: string;
    }>;
    validateAuthorizationRequest(clientId: string): Promise<{
        picture: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            originalName: string | null;
            path: string;
            fileSize: number;
            type: string;
            thumbnail: string | null;
            alt: string | null;
            thumbnailTimestamp: number | null;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        pictureId: string | null;
        redirectUrl: string;
        clientId: string;
        clientSecret: string;
    }>;
    createAuthorizationCode(oauthAppId: string, userId: string, organizationId: string): Promise<string>;
    exchangeCodeForToken(code: string, clientId: string, clientSecret: string): Promise<{
        id: string;
        cus: string;
        access_token: string;
        token_type: string;
    }>;
    getOrgByOAuthToken(token: string): Promise<{
        organization: {
            subscription: {
                subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
                totalChannels: number;
                isLifetime: boolean;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            apiKey: string | null;
            paymentId: string | null;
            streakSince: Date | null;
            createdAt: Date;
            updatedAt: Date;
            allowTrial: boolean;
            isTrailing: boolean;
            shortlink: import(".prisma/client").$Enums.ShortLinkPreference;
        };
        user: {
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        userId: string;
        accessToken: string | null;
        oauthAppId: string;
        authorizationCode: string | null;
        codeExpiresAt: Date | null;
        revokedAt: Date | null;
    }>;
    getApprovedApps(userId: string): Promise<({
        oauthApp: {
            picture: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                organizationId: string;
                originalName: string | null;
                path: string;
                fileSize: number;
                type: string;
                thumbnail: string | null;
                alt: string | null;
                thumbnailTimestamp: number | null;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            pictureId: string | null;
            redirectUrl: string;
            clientId: string;
            clientSecret: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        userId: string;
        accessToken: string | null;
        oauthAppId: string;
        authorizationCode: string | null;
        codeExpiresAt: Date | null;
        revokedAt: Date | null;
    })[]>;
    revokeApp(userId: string, authId: string): Promise<{
        success: boolean;
    }>;
}
