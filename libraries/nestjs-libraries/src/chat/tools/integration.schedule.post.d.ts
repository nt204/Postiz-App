import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
export declare class IntegrationSchedulePostTool implements AgentToolInterface {
    private _postsService;
    private _integrationService;
    constructor(_postsService: PostsService, _integrationService: IntegrationService);
    name: string;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "schedulePostTool", unknown>;
}
