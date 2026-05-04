import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { VideoManager } from '@gitroom/nestjs-libraries/videos/video.manager';
export declare class GenerateVideoOptionsTool implements AgentToolInterface {
    private _videoManagerService;
    constructor(_videoManagerService: VideoManager);
    name: string;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "generateVideoOptions", unknown>;
}
