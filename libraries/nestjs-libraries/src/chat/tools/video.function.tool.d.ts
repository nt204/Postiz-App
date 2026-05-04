import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { VideoManager } from '@gitroom/nestjs-libraries/videos/video.manager';
import { ModuleRef } from '@nestjs/core';
export declare class VideoFunctionTool implements AgentToolInterface {
    private _videoManagerService;
    private _moduleRef;
    constructor(_videoManagerService: VideoManager, _moduleRef: ModuleRef);
    name: string;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "videoFunctionTool", unknown>;
}
