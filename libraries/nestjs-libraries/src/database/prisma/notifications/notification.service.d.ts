import { NotificationsRepository } from '@gitroom/nestjs-libraries/database/prisma/notifications/notifications.repository';
import { EmailService } from '@gitroom/nestjs-libraries/services/email.service';
import { OrganizationRepository } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.repository';
import { TemporalService } from 'nestjs-temporal-core';
export type NotificationType = 'success' | 'fail' | 'info';
export declare class NotificationService {
    private _notificationRepository;
    private _emailService;
    private _organizationRepository;
    private _temporalService;
    constructor(_notificationRepository: NotificationsRepository, _emailService: EmailService, _organizationRepository: OrganizationRepository, _temporalService: TemporalService);
    getMainPageCount(organizationId: string, userId: string): Promise<{
        total: number;
    }>;
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
    inAppNotification(orgId: string, subject: string, message: string, sendEmail?: boolean, digest?: boolean, type?: NotificationType): Promise<void>;
    sendEmailsToOrg(orgId: string, subject: string, message: string, type?: NotificationType): Promise<void>;
    sendEmail(to: string, subject: string, html: string, replyTo?: string): Promise<void>;
    hasEmailProvider(): boolean;
}
