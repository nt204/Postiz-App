import { Mastra } from '@mastra/core/mastra';
import { LoadToolsService } from '@gitroom/nestjs-libraries/chat/load.tools.service';
export declare class MastraService {
    private _loadToolsService;
    static mastra: Mastra;
    constructor(_loadToolsService: LoadToolsService);
    mastra(): Promise<Mastra<Record<string, import("@mastra/core/agent").Agent<any, import("@mastra/core/agent").ToolsInput, undefined, unknown>>, Record<string, import("@mastra/core/workflows").AnyWorkflow>, Record<string, import("@mastra/core/vector").MastraVector<any>>, Record<string, import("@mastra/core/dist/tts").MastraTTS>, import("@mastra/core/logger").IMastraLogger, Record<string, import("@mastra/core/mcp").MCPServerBase<any>>, Record<string, import("@mastra/core/evals").MastraScorer<any, any, any, any>>, Record<string, import("@mastra/core/tools").ToolAction<any, any, any, any, any, any, unknown>>, Record<string, import("@mastra/core/processors").Processor<any, unknown>>, Record<string, import("@mastra/core/memory").MastraMemory>>>;
}
