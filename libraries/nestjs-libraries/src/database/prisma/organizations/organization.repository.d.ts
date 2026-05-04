import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { ShortLinkPreference } from '@prisma/client';
import { CreateOrgUserDto } from '@gitroom/nestjs-libraries/dtos/auth/create.org.user.dto';
export declare class OrganizationRepository {
    private _organization;
    private _userOrg;
    private _user;
    constructor(_organization: PrismaRepository<'organization'>, _userOrg: PrismaRepository<'userOrganization'>, _user: PrismaRepository<'user'>);
    createMaxUser(id: string, name: string, saasName: string, email: string): import(".prisma/client").Prisma.Prisma__OrganizationClient<{
        id: string;
        apiKey: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getOrgByApiKey(api: string): import(".prisma/client").Prisma.Prisma__OrganizationClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getCount(): import(".prisma/client").Prisma.PrismaPromise<number>;
    getUserOrg(id: string): import(".prisma/client").Prisma.Prisma__UserOrganizationClient<{
        organization: {
            subscription: {
                subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
                totalChannels: number;
                isLifetime: boolean;
            };
            users: {
                id: string;
                disabled: boolean;
                role: import(".prisma/client").$Enums.Role;
                userId: string;
            }[];
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getImpersonateUser(name: string): import(".prisma/client").Prisma.PrismaPromise<{
        organization: {
            id: string;
        };
        user: {
            email: string;
            id: string;
            name: string;
        };
        id: string;
    }[]>;
    updateApiKey(orgId: string): import(".prisma/client").Prisma.Prisma__OrganizationClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getOrgsByUserId(userId: string): Promise<({
        subscription: {
            createdAt: Date;
            subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
            totalChannels: number;
            isLifetime: boolean;
        };
        users: {
            disabled: boolean;
            role: import(".prisma/client").$Enums.Role;
        }[];
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
    })[]>;
    getOrgById(id: string): Promise<{
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
    }>;
    addUserToOrg(userId: string, id: string, orgId: string, role: 'USER' | 'ADMIN'): Promise<false | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        disabled: boolean;
        role: import(".prisma/client").$Enums.Role;
        userId: string;
    }>;
    createOrgAndUser(body: Omit<CreateOrgUserDto, 'providerToken'> & {
        providerId?: string;
    }, hasEmail: boolean, ip: string, userAgent: string): Promise<{
        id: string;
        users: {
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
        }[];
    }>;
    getOrgByCustomerId(customerId: string): import(".prisma/client").Prisma.Prisma__OrganizationClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    setStreak(organizationId: string, type: 'start' | 'end'): Promise<void>;
    getTeam(orgId: string): Promise<{
        users: {
            user: {
                email: string;
                id: string;
                sendSuccessEmails: boolean;
                sendFailureEmails: boolean;
                sendStreakEmails: boolean;
            };
            role: import(".prisma/client").$Enums.Role;
        }[];
    }>;
    getAllUsersOrgs(orgId: string): import(".prisma/client").Prisma.Prisma__OrganizationClient<{
        users: {
            user: {
                email: string;
                id: string;
                sendSuccessEmails: boolean;
                sendFailureEmails: boolean;
            };
        }[];
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    deleteTeamMember(orgId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        disabled: boolean;
        role: import(".prisma/client").$Enums.Role;
        userId: string;
    }>;
    disableOrEnableNonSuperAdminUsers(orgId: string, disable: boolean): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    getShortlinkPreference(orgId: string): import(".prisma/client").Prisma.Prisma__OrganizationClient<{
        shortlink: import(".prisma/client").$Enums.ShortLinkPreference;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateShortlinkPreference(orgId: string, shortlink: ShortLinkPreference): import(".prisma/client").Prisma.Prisma__OrganizationClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
