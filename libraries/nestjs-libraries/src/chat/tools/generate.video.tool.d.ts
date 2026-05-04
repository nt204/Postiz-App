import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
import { VideoManager } from '@gitroom/nestjs-libraries/videos/video.manager';
export declare class GenerateVideoTool implements AgentToolInterface {
    private _mediaService;
    private _videoManager;
    constructor(_mediaService: MediaService, _videoManager: VideoManager);
    name: string;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "generateVideoTool", unknown>;
}
