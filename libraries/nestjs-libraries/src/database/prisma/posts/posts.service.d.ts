import { PostsRepository } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.repository';
import { CreatePostDto } from '@gitroom/nestjs-libraries/dtos/posts/create.post.dto';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { Integration, Post, State } from '@prisma/client';
import { GetPostsDto } from '@gitroom/nestjs-libraries/dtos/posts/get.posts.dto';
import { GetPostsListDto } from '@gitroom/nestjs-libraries/dtos/posts/get.posts.list.dto';
import { CreateGeneratedPostsDto } from '@gitroom/nestjs-libraries/dtos/generator/create.generated.posts.dto';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
import { ShortLinkService } from '@gitroom/nestjs-libraries/short-linking/short.link.service';
import { CreateTagDto } from '@gitroom/nestjs-libraries/dtos/posts/create.tag.dto';
import { OpenaiService } from '@gitroom/nestjs-libraries/openai/openai.service';
import { TemporalService } from 'nestjs-temporal-core';
import { AnalyticsData } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { RefreshIntegrationService } from '@gitroom/nestjs-libraries/integrations/refresh.integration.service';
type PostWithConditionals = Post & {
    integration?: Integration;
    childrenPost: Post[];
};
export declare class PostsService {
    private _postRepository;
    private _integrationManager;
    private _integrationService;
    private _mediaService;
    private _shortLinkService;
    private _openaiService;
    private _temporalService;
    private _refreshIntegrationService;
    private storage;
    private readonly logger;
    constructor(_postRepository: PostsRepository, _integrationManager: IntegrationManager, _integrationService: IntegrationService, _mediaService: MediaService, _shortLinkService: ShortLinkService, _openaiService: OpenaiService, _temporalService: TemporalService, _refreshIntegrationService: RefreshIntegrationService);
    private getWorkflowErrorMessage;
    searchForMissingThreeHoursPosts(): import(".prisma/client").Prisma.PrismaPromise<{
        integration: {
            providerIdentifier: string;
        };
        id: string;
        organizationId: string;
        publishDate: Date;
    }[]>;
    updatePost(id: string, postId: string, releaseURL: string): import(".prisma/client").Prisma.Prisma__PostClient<{
        error: string | null;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string;
        title: string | null;
        group: string;
        image: string | null;
        delay: number;
        settings: string | null;
        state: import(".prisma/client").$Enums.State;
        publishDate: Date;
        integrationId: string;
        parentPostId: string | null;
        releaseId: string | null;
        releaseURL: string | null;
        submittedForOrderId: string | null;
        submittedForOrganizationId: string | null;
        approvedSubmitForOrder: import(".prisma/client").$Enums.APPROVED_SUBMIT_FOR_ORDER;
        lastMessageId: string | null;
        intervalInDays: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getMissingContent(orgId: string, postId: string, forceRefresh?: boolean): Promise<{
        id: string;
        url: string;
    }[]>;
    updateReleaseId(orgId: string, postId: string, releaseId: string): Promise<{
        error: string | null;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string;
        title: string | null;
        group: string;
        image: string | null;
        delay: number;
        settings: string | null;
        state: import(".prisma/client").$Enums.State;
        publishDate: Date;
        integrationId: string;
        parentPostId: string | null;
        releaseId: string | null;
        releaseURL: string | null;
        submittedForOrderId: string | null;
        submittedForOrganizationId: string | null;
        approvedSubmitForOrder: import(".prisma/client").$Enums.APPROVED_SUBMIT_FOR_ORDER;
        lastMessageId: string | null;
        intervalInDays: number | null;
    }>;
    checkPostAnalytics(orgId: string, postId: string, date: number, forceRefresh?: boolean): Promise<AnalyticsData[] | {
        missing: true;
    }>;
    getStatistics(orgId: string, id: string): Promise<{
        clicks: {
            short: string;
            original: string;
            clicks: string;
        }[];
    }>;
    mapTypeToPost(body: CreatePostDto, organization: string, replaceDraft?: boolean): Promise<CreatePostDto>;
    getPostsRecursively(id: string, includeIntegration?: boolean, orgId?: string, isFirst?: boolean): Promise<PostWithConditionals[]>;
    getPosts(orgId: string, query: GetPostsDto): Promise<any[]>;
    getPostsMinified(orgId: string, query: GetPostsDto): Promise<Record<string, any>>;
    getPostsList(orgId: string, query: GetPostsListDto): Promise<Record<string, any>>;
    updateMedia(id: string, imagesList: any[], convertToJPEG?: boolean): Promise<any[]>;
    getPostGroupDebugExport(orgId: string, group: string): Promise<{
        type: "draft";
        shortLink: boolean;
        date: any;
        tags: any;
        posts: {
            integration: {
                id: string;
            };
            group: any;
            settings: any;
            value: {
                content: string;
                image: any;
                delay: number;
            }[];
        }[];
        _debug: {
            providerIdentifier: any;
            providerName: any;
            state: any;
            error: any;
            errors: {
                message: string;
                platform: string;
                body: string;
                createdAt: Date;
            }[];
            originalGroup: string;
            originalPublishDate: any;
            exportedAt: `${string}-${string}-${string}T${string}:${string}:${string}Z`;
        };
    }>;
    getPostsByGroup(orgId: string, group: string): Promise<{
        group: string;
        posts: {
            image: any[];
            error: string | null;
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            content: string;
            title: string | null;
            group: string;
            delay: number;
            settings: string | null;
            state: import(".prisma/client").$Enums.State;
            publishDate: Date;
            integrationId: string;
            parentPostId: string | null;
            releaseId: string | null;
            releaseURL: string | null;
            submittedForOrderId: string | null;
            submittedForOrganizationId: string | null;
            approvedSubmitForOrder: import(".prisma/client").$Enums.APPROVED_SUBMIT_FOR_ORDER;
            lastMessageId: string | null;
            intervalInDays: number | null;
            integration?: Integration;
            childrenPost: Post[];
        }[];
        integrationPicture: string;
        integration: string;
        settings: any;
    }>;
    arrangePostsByGroup(all: any, parent?: string): PostWithConditionals[];
    getPost(orgId: string, id: string, convertToJPEG?: boolean): Promise<{
        group: string;
        posts: {
            image: any[];
            error: string | null;
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            content: string;
            title: string | null;
            group: string;
            delay: number;
            settings: string | null;
            state: import(".prisma/client").$Enums.State;
            publishDate: Date;
            integrationId: string;
            parentPostId: string | null;
            releaseId: string | null;
            releaseURL: string | null;
            submittedForOrderId: string | null;
            submittedForOrganizationId: string | null;
            approvedSubmitForOrder: import(".prisma/client").$Enums.APPROVED_SUBMIT_FOR_ORDER;
            lastMessageId: string | null;
            intervalInDays: number | null;
            integration?: Integration;
            childrenPost: Post[];
        }[];
        integrationPicture: string;
        integration: string;
        settings: any;
    }>;
    getOldPosts(orgId: string, date: string): Promise<{
        integration: {
            id: string;
            name: string;
            picture: string;
            type: string;
            providerIdentifier: string;
        };
        id: string;
        content: string;
        state: import(".prisma/client").$Enums.State;
        publishDate: Date;
        releaseURL: string;
    }[]>;
    updateTags(orgId: string, post: Post[]): Promise<Post[]>;
    checkInternalPlug(integration: Integration, orgId: string, id: string, settings: any): Promise<{
        type: string;
        post: string;
        originalIntegration: string;
        integration: string;
        plugName: string;
        orgId: string;
        delay: number;
        information: {
            name: string;
            integrations: {
                id: string;
            }[];
            delay: string;
            active: boolean;
        };
    }[]>;
    checkPlugs(orgId: string, providerName: string, integrationId: string): Promise<{
        type: string;
        plugId: string;
        delay: any;
        totalRuns: any;
    }[]>;
    deletePost(orgId: string, group: string): Promise<{
        error: boolean;
    }>;
    countPostsFromDay(orgId: string, date: Date): Promise<number>;
    getPostByForWebhookId(id: string): Promise<{
        integration: {
            id: string;
            name: string;
            picture: string;
            type: string;
            providerIdentifier: string;
        };
        id: string;
        content: string;
        state: import(".prisma/client").$Enums.State;
        publishDate: Date;
        releaseURL: string;
    }[]>;
    startWorkflow(taskQueue: string, postId: string, orgId: string, state: State): Promise<void>;
    createPost(orgId: string, body: CreatePostDto): Promise<any[]>;
    separatePosts(content: string, len: number): Promise<{
        posts: any[];
    }>;
    changeState(id: string, state: State, err?: any, body?: any): Promise<{
        integration: {
            providerIdentifier: string;
        };
    } & {
        error: string | null;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string;
        title: string | null;
        group: string;
        image: string | null;
        delay: number;
        settings: string | null;
        state: import(".prisma/client").$Enums.State;
        publishDate: Date;
        integrationId: string;
        parentPostId: string | null;
        releaseId: string | null;
        releaseURL: string | null;
        submittedForOrderId: string | null;
        submittedForOrganizationId: string | null;
        approvedSubmitForOrder: import(".prisma/client").$Enums.APPROVED_SUBMIT_FOR_ORDER;
        lastMessageId: string | null;
        intervalInDays: number | null;
    }>;
    changePostStatus(orgId: string, id: string, status: 'draft' | 'schedule'): Promise<{
        id: string;
        state: "QUEUE" | "DRAFT";
    }>;
    changeDate(orgId: string, id: string, date: string, action?: 'schedule' | 'update'): Promise<{
        error: string | null;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string;
        title: string | null;
        group: string;
        image: string | null;
        delay: number;
        settings: string | null;
        state: import(".prisma/client").$Enums.State;
        publishDate: Date;
        integrationId: string;
        parentPostId: string | null;
        releaseId: string | null;
        releaseURL: string | null;
        submittedForOrderId: string | null;
        submittedForOrganizationId: string | null;
        approvedSubmitForOrder: import(".prisma/client").$Enums.APPROVED_SUBMIT_FOR_ORDER;
        lastMessageId: string | null;
        intervalInDays: number | null;
    }>;
    generatePostsDraft(orgId: string, body: CreateGeneratedPostsDto): Promise<void>;
    findAllExistingCategories(): import(".prisma/client").Prisma.PrismaPromise<{
        category: string;
    }[]>;
    findAllExistingTopicsOfCategory(category: string): import(".prisma/client").Prisma.PrismaPromise<{
        topic: string;
    }[]>;
    findPopularPosts(category: string, topic?: string): import(".prisma/client").Prisma.PrismaPromise<{
        content: string;
        hook: string;
    }[]>;
    findFreeDateTime(orgId: string, integrationId?: string): Promise<string>;
    createPopularPosts(post: {
        category: string;
        topic: string;
        content: string;
        hook: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        category: string;
        topic: string;
        hook: string;
    }>;
    private findFreeDateTimeRecursive;
    getComments(postId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        userId: string;
        content: string;
        postId: string;
    }[]>;
    getTags(orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }[]>;
    createTag(orgId: string, body: CreateTagDto): import(".prisma/client").Prisma.Prisma__TagsClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    editTag(id: string, orgId: string, body: CreateTagDto): import(".prisma/client").Prisma.Prisma__TagsClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    deleteTag(id: string, orgId: string): import(".prisma/client").Prisma.Prisma__TagsClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createComment(orgId: string, userId: string, postId: string, comment: string): import(".prisma/client").Prisma.Prisma__CommentsClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        userId: string;
        content: string;
        postId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
export {};
