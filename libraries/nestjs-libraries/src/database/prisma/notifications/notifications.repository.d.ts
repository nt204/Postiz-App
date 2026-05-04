import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
export declare class NotificationsRepository {
    private _notifications;
    private _user;
    constructor(_notifications: PrismaRepository<'notifications'>, _user: PrismaRepository<'user'>);
    getLastReadNotification(userId: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        lastReadNotifications: Date;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getMainPageCount(organizationId: string, userId: string): Promise<{
        total: number;
    }>;
    createNotification(organizationId: string, content: string): Promise<void>;
    getNotificationsSince(organizationId: string, since: string): Promise<{
        link: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string;
    }[]>;
    getNotificationsPaginated(organizationId: string, page: number): Promise<{
        notifications: {
            link: string;
            id: string;
            createdAt: Date;
            content: string;
        }[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
    getNotifications(organizationId: string, userId: string): Promise<{
        lastReadNotifications: Date;
        notifications: {
            createdAt: Date;
            content: string;
        }[];
    }>;
}
