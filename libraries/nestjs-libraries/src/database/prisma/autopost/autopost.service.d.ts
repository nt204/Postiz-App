import { AutopostRepository } from '@gitroom/nestjs-libraries/database/prisma/autopost/autopost.repository';
import { AutopostDto } from '@gitroom/nestjs-libraries/dtos/autopost/autopost.dto';
import { StateGraph } from '@langchain/langgraph';
import { AutoPost, Integration } from '@prisma/client';
import { BaseMessage } from '@langchain/core/messages';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { TemporalService } from 'nestjs-temporal-core';
interface WorkflowChannelsState {
    messages: BaseMessage[];
    integrations: Integration[];
    body: AutoPost;
    description: string;
    image: string;
    id: string;
    load: {
        date: string;
        url: string;
        description: string;
    };
}
export declare class AutopostService {
    private _autopostsRepository;
    private _temporalService;
    private _integrationService;
    private _postsService;
    constructor(_autopostsRepository: AutopostRepository, _temporalService: TemporalService, _integrationService: IntegrationService, _postsService: PostsService);
    stopAll(org: string): Promise<void>;
    getAutoposts(orgId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string | null;
        url: string;
        title: string;
        lastUrl: string;
        onSlot: boolean;
        syncLast: boolean;
        active: boolean;
        addPicture: boolean;
        generateContent: boolean;
        integrations: string;
    }[]>;
    createAutopost(orgId: string, body: AutopostDto, id?: string): Promise<{
        id: string;
        active: boolean;
    }>;
    changeActive(orgId: string, id: string, active: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string | null;
        url: string;
        title: string;
        lastUrl: string;
        onSlot: boolean;
        syncLast: boolean;
        active: boolean;
        addPicture: boolean;
        generateContent: boolean;
        integrations: string;
    }>;
    processCron(active: boolean, orgId: string, id: string): Promise<false | import("@temporalio/client").WorkflowHandleWithStartDetails<import("@temporalio/common").Workflow> | import("nestjs-temporal-core").WorkflowTerminationResult>;
    deleteAutopost(orgId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string | null;
        url: string;
        title: string;
        lastUrl: string;
        onSlot: boolean;
        syncLast: boolean;
        active: boolean;
        addPicture: boolean;
        generateContent: boolean;
        integrations: string;
    }>;
    loadXML(url: string): Promise<{
        success: boolean;
        date: any;
        url: any;
        description: string;
    } | {
        success: boolean;
        date?: undefined;
        url?: undefined;
        description?: undefined;
    }>;
    static state: () => StateGraph<WorkflowChannelsState, WorkflowChannelsState, Partial<WorkflowChannelsState>, "__start__", import("@langchain/langgraph").StateDefinition, import("@langchain/langgraph").StateDefinition, import("@langchain/langgraph").StateDefinition, unknown, unknown, unknown>;
    loadUrl(url: string): Promise<string>;
    generateDescription(state: WorkflowChannelsState): Promise<{
        description: string;
        messages: BaseMessage[];
        integrations: Integration[];
        body: AutoPost;
        image: string;
        id: string;
        load: {
            date: string;
            url: string;
            description: string;
        };
    }>;
    generatePicture(state: WorkflowChannelsState): Promise<{
        image: any;
        messages: BaseMessage[];
        integrations: Integration[];
        body: AutoPost;
        description: string;
        id: string;
        load: {
            date: string;
            url: string;
            description: string;
        };
    }>;
    schedulePost(state: WorkflowChannelsState): Promise<void>;
    updateUrl(state: WorkflowChannelsState): Promise<void>;
    startAutopost(id: string): Promise<void>;
}
export {};
