import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
export declare class OAuthRepository {
    private _oauthApp;
    private _oauthAuth;
    constructor(_oauthApp: PrismaRepository<'oAuthApp'>, _oauthAuth: PrismaRepository<'oAuthAuthorization'>);
    getAppByOrgId(orgId: string): import(".prisma/client").Prisma.Prisma__OAuthAppClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getAppByClientId(clientId: string): import(".prisma/client").Prisma.Prisma__OAuthAppClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createApp(orgId: string, data: {
        name: string;
        description?: string;
        pictureId?: string;
        redirectUrl: string;
        clientId: string;
        clientSecret: string;
    }): import(".prisma/client").Prisma.Prisma__OAuthAppClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateApp(orgId: string, data: {
        name?: string;
        description?: string;
        pictureId?: string;
        redirectUrl?: string;
    }): Promise<{
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
    updateClientSecret(orgId: string, newSecret: string): Promise<{
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
    createAuthorization(data: {
        oauthAppId: string;
        userId: string;
        organizationId: string;
        authorizationCode: string;
        codeExpiresAt: Date;
    }): import(".prisma/client").Prisma.Prisma__OAuthAuthorizationClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findByCode(encryptedCode: string): import(".prisma/client").Prisma.Prisma__OAuthAuthorizationClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    exchangeCodeForToken(id: string, encryptedToken: string): import(".prisma/client").Prisma.Prisma__OAuthAuthorizationClient<{
        organization: {
            paymentId: string;
        };
        organizationId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findByAccessToken(encryptedToken: string): import(".prisma/client").Prisma.Prisma__OAuthAuthorizationClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getApprovedApps(userId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    revokeAuthorization(userId: string, authId: string): import(".prisma/client").Prisma.Prisma__OAuthAuthorizationClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    revokeAllForApp(oauthAppId: string): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}
