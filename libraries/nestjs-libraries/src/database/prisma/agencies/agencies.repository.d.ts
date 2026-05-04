import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateAgencyDto } from '@gitroom/nestjs-libraries/dtos/agencies/create.agency.dto';
export declare class AgenciesRepository {
    private _socialMediaAgencies;
    private _socialMediaAgenciesNiche;
    constructor(_socialMediaAgencies: PrismaRepository<'socialMediaAgency'>, _socialMediaAgenciesNiche: PrismaRepository<'socialMediaAgencyNiche'>);
    getAllAgencies(): import(".prisma/client").Prisma.PrismaPromise<({
        logo: {
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
        niches: {
            agencyId: string;
            niche: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        logoId: string | null;
        website: string | null;
        slug: string | null;
        facebook: string | null;
        instagram: string | null;
        twitter: string | null;
        linkedIn: string | null;
        youtube: string | null;
        tiktok: string | null;
        otherSocialMedia: string | null;
        shortDescription: string;
        approved: boolean;
    })[]>;
    getCount(): import(".prisma/client").Prisma.PrismaPromise<number>;
    getAllAgenciesSlug(): import(".prisma/client").Prisma.PrismaPromise<{
        slug: string;
    }[]>;
    approveOrDecline(action: string, id: string): import(".prisma/client").Prisma.Prisma__SocialMediaAgencyClient<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        logoId: string | null;
        website: string | null;
        slug: string | null;
        facebook: string | null;
        instagram: string | null;
        twitter: string | null;
        linkedIn: string | null;
        youtube: string | null;
        tiktok: string | null;
        otherSocialMedia: string | null;
        shortDescription: string;
        approved: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getAgencyById(id: string): import(".prisma/client").Prisma.Prisma__SocialMediaAgencyClient<{
        user: {
            password: string | null;
            email: string;
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            providerName: import(".prisma/client").$Enums.Provider;
            lastName: string | null;
            isSuperAdmin: boolean;
            bio: string | null;
            audience: number;
            providerId: string | null;
            timezone: number;
            lastReadNotifications: Date;
            inviteId: string | null;
            activated: boolean;
            account: string | null;
            connectedAccount: boolean;
            lastOnline: Date;
            ip: string | null;
            agent: string | null;
            sendSuccessEmails: boolean;
            sendFailureEmails: boolean;
            sendStreakEmails: boolean;
            pictureId: string | null;
        };
        logo: {
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
        niches: {
            agencyId: string;
            niche: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        logoId: string | null;
        website: string | null;
        slug: string | null;
        facebook: string | null;
        instagram: string | null;
        twitter: string | null;
        linkedIn: string | null;
        youtube: string | null;
        tiktok: string | null;
        otherSocialMedia: string | null;
        shortDescription: string;
        approved: boolean;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getAgencyInformation(agency: string): import(".prisma/client").Prisma.Prisma__SocialMediaAgencyClient<{
        logo: {
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
        niches: {
            agencyId: string;
            niche: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        logoId: string | null;
        website: string | null;
        slug: string | null;
        facebook: string | null;
        instagram: string | null;
        twitter: string | null;
        linkedIn: string | null;
        youtube: string | null;
        tiktok: string | null;
        otherSocialMedia: string | null;
        shortDescription: string;
        approved: boolean;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getAgencyByUser(user: User): import(".prisma/client").Prisma.Prisma__SocialMediaAgencyClient<{
        logo: {
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
        niches: {
            agencyId: string;
            niche: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        logoId: string | null;
        website: string | null;
        slug: string | null;
        facebook: string | null;
        instagram: string | null;
        twitter: string | null;
        linkedIn: string | null;
        youtube: string | null;
        tiktok: string | null;
        otherSocialMedia: string | null;
        shortDescription: string;
        approved: boolean;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createAgency(user: User, body: CreateAgencyDto): Promise<{
        id: string;
    }>;
}
