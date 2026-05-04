import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { RefreshIntegrationService } from '@gitroom/nestjs-libraries/integrations/refresh.integration.service';
export declare class IntegrationTriggerTool implements AgentToolInterface {
    private _integrationManager;
    private _integrationService;
    private _refreshIntegrationService;
    constructor(_integrationManager: IntegrationManager, _integrationService: IntegrationService, _refreshIntegrationService: RefreshIntegrationService);
    name: string;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "triggerTool", unknown>;
}
