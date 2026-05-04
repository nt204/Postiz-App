import { SubscriptionRepository } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.repository';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { Organization } from '@prisma/client';
export declare class SubscriptionService {
    private readonly _subscriptionRepository;
    private readonly _integrationService;
    private readonly _organizationService;
    constructor(_subscriptionRepository: SubscriptionRepository, _integrationService: IntegrationService, _organizationService: OrganizationService);
    getSubscriptionByOrganizationId(organizationId: string): import(".prisma/client").Prisma.Prisma__SubscriptionClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
        identifier: string | null;
        cancelAt: Date | null;
        period: import(".prisma/client").$Enums.Period;
        totalChannels: number;
        isLifetime: boolean;
        deletedAt: Date | null;
        organizationId: string;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    useCredit<T>(organization: Organization, type: string, func: () => Promise<T>): Promise<T>;
    getCode(code: string): import(".prisma/client").Prisma.Prisma__UsedCodesClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        code: string;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    deleteSubscription(customerId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    updateCustomerId(organizationId: string, customerId: string): import(".prisma/client").Prisma.Prisma__OrganizationClient<{
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
    checkSubscription(organizationId: string, subscriptionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
        identifier: string | null;
        cancelAt: Date | null;
        period: import(".prisma/client").$Enums.Period;
        totalChannels: number;
        isLifetime: boolean;
        deletedAt: Date | null;
        organizationId: string;
    }>;
    modifySubscriptionByOrg(organizationId: string, totalChannels: number, billing: 'FREE' | 'STANDARD' | 'TEAM' | 'PRO' | 'ULTIMATE'): Promise<boolean>;
    modifySubscription(customerId: string, totalChannels: number, billing: 'FREE' | 'STANDARD' | 'TEAM' | 'PRO' | 'ULTIMATE'): Promise<boolean>;
    createOrUpdateSubscription(isTrailing: boolean, identifier: string, customerId: string, totalChannels: number, billing: 'STANDARD' | 'TEAM' | 'PRO' | 'ULTIMATE', period: 'MONTHLY' | 'YEARLY', cancelAt: number | null, code?: string, org?: string): Promise<void | {}>;
    getSubscriptionByIdentifier(identifier: string): import(".prisma/client").Prisma.Prisma__SubscriptionClient<{
        organization: {
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
        identifier: string | null;
        cancelAt: Date | null;
        period: import(".prisma/client").$Enums.Period;
        totalChannels: number;
        isLifetime: boolean;
        deletedAt: Date | null;
        organizationId: string;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getSubscription(organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
        identifier: string | null;
        cancelAt: Date | null;
        period: import(".prisma/client").$Enums.Period;
        totalChannels: number;
        isLifetime: boolean;
        deletedAt: Date | null;
        organizationId: string;
    }>;
    checkCredits(organization: Organization, checkType?: string): Promise<{
        credits: number;
    }>;
    lifeTime(orgId: string, identifier: string, subscription: any): Promise<void | {}>;
    addSubscription(orgId: string, userId: string, subscription: any): Promise<void | {}>;
}
