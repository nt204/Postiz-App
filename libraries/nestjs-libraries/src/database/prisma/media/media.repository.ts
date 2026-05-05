import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { SaveMediaInformationDto } from '@gitroom/nestjs-libraries/dtos/media/save.media.information.dto';

@Injectable()
export class MediaRepository {
  constructor(private _media: PrismaRepository<'media'>) {}

  private get _folder() {
    return (this._media.model as any).mediaFolder;
  }

  saveFile(org: string, fileName: string, filePath: string, originalName?: string) {
    return this._media.model.media.create({
      data: {
        organization: {
          connect: {
            id: org,
          },
        },
        name: fileName,
        path: filePath,
        originalName: originalName || null,
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        path: true,
        thumbnail: true,
        alt: true,
      },
    });
  }

  getMediaById(id: string) {
    return this._media.model.media.findUnique({
      where: {
        id,
      },
    });
  }

  deleteMedia(org: string, id: string) {
    return this._media.model.media.update({
      where: {
        id,
        organizationId: org,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  saveMediaInformation(org: string, data: SaveMediaInformationDto) {
    return this._media.model.media.update({
      where: {
        id: data.id,
        organizationId: org,
      },
      data: {
        alt: data.alt,
        thumbnail: data.thumbnail,
        thumbnailTimestamp: data.thumbnailTimestamp,
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        alt: true,
        thumbnail: true,
        path: true,
        thumbnailTimestamp: true,
      },
    });
  }

  async getMedia(
    org: string,
    page: number,
    search?: string,
    folderId?: string,
    type?: string
  ) {
    const pageNum = (page || 1) - 1;
    const trimmedSearch = search?.trim();

    const where: any = {
      organizationId: org,
      deletedAt: null,
    };

    if (trimmedSearch) {
      where.originalName = { contains: trimmedSearch, mode: 'insensitive' };
    }

    if (folderId === 'none') {
      where.folderId = null;
    } else if (folderId) {
      where.folderId = folderId;
    }

    if (type === 'image') {
      where.NOT = { path: { contains: 'mp4' } };
    } else if (type === 'video') {
      where.path = { contains: 'mp4' };
    }

    const pages = Math.ceil(
      (await this._media.model.media.count({ where })) / 18
    );
    const results = await this._media.model.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        originalName: true,
        path: true,
        thumbnail: true,
        alt: true,
        thumbnailTimestamp: true,
        folderId: true,
      },
      skip: pageNum * 18,
      take: 18,
    });

    return { pages, results };
  }

  getFolders(org: string) {
    return this._folder.findMany({
      where: { organizationId: org },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  createFolder(org: string, name: string) {
    return this._folder.create({
      data: { name, organizationId: org },
      select: { id: true, name: true },
    });
  }

  async deleteFolder(org: string, id: string) {
    await this._media.model.media.updateMany({
      where: { folderId: id, organizationId: org },
      data: { folderId: null },
    });
    return this._folder.delete({
      where: { id, organizationId: org },
    });
  }

  moveToFolder(org: string, mediaId: string, folderId: string | null) {
    return this._media.model.media.update({
      where: { id: mediaId, organizationId: org },
      data: { folderId: folderId || null },
      select: { id: true, folderId: true },
    });
  }
}
