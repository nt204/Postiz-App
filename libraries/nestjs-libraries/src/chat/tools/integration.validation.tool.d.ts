import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
export declare class IntegrationValidationTool implements AgentToolInterface {
    private _integrationManager;
    constructor(_integrationManager: IntegrationManager);
    name: string;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "integrationSchema", unknown>;
}
