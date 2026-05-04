import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { AnnouncementDto } from '@gitroom/nestjs-libraries/dtos/announcements/announcements.dto';
export declare class AnnouncementsRepository {
    private _announcements;
    constructor(_announcements: PrismaRepository<'announcement'>);
    getAnnouncements(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        description: string;
        createdAt: Date;
        title: string;
        color: import(".prisma/client").$Enums.AnnouncementColor;
    }[]>;
    createAnnouncement(body: AnnouncementDto): import(".prisma/client").Prisma.Prisma__AnnouncementClient<{
        id: string;
        description: string;
        createdAt: Date;
        title: string;
        color: import(".prisma/client").$Enums.AnnouncementColor;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    deleteAnnouncement(id: string): import(".prisma/client").Prisma.Prisma__AnnouncementClient<{
        id: string;
        description: string;
        createdAt: Date;
        title: string;
        color: import(".prisma/client").$Enums.AnnouncementColor;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
