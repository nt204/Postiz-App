import { CreateOrgUserDto } from '@gitroom/nestjs-libraries/dtos/auth/create.org.user.dto';
import { OrganizationRepository } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.repository';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
import { AddTeamMemberDto } from '@gitroom/nestjs-libraries/dtos/settings/add.team.member.dto';
import { Organization, ShortLinkPreference } from '@prisma/client';
export declare class OrganizationService {
    private _organizationRepository;
    private _notificationsService;
    constructor(_organizationRepository: OrganizationRepository, _notificationsService: NotificationService);
    createOrgAndUser(body: Omit<CreateOrgUserDto, 'providerToken'> & {
        providerId?: string;
    }, ip: string, userAgent: string): Promise<{
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
    getCount(): Promise<number>;
    createMaxUser(id: string, name: string, saasName: string, email: string): Promise<{
        id: string;
        apiKey: string;
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
    setStreak(organizationId: string, type: 'start' | 'end'): Promise<void>;
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
    inviteTeamMember(orgId: string, body: AddTeamMemberDto): Promise<{
        url: string;
    }>;
    deleteTeamMember(org: Organization, userId: string): Promise<{
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
