import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
export declare class IntegrationListTool implements AgentToolInterface {
    private _integrationService;
    constructor(_integrationService: IntegrationService);
    name: string;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "integrationList", unknown>;
}
