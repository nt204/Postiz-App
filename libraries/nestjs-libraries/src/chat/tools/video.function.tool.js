"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoFunctionTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const common_1 = require("@nestjs/common");
const video_manager_1 = require("../../videos/video.manager");
const zod_1 = tslib_1.__importDefault(require("zod"));
const core_1 = require("@nestjs/core");
const auth_context_1 = require("../auth.context");
let VideoFunctionTool = class VideoFunctionTool {
    constructor(_videoManagerService, _moduleRef) {
        this._videoManagerService = _videoManagerService;
        this._moduleRef = _moduleRef;
        this.name = 'videoFunctionTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'videoFunctionTool',
            description: `Sometimes when we want to generate videos we might need to get some additional information like voice_id, etc`,
            mcp: {
                annotations: {
                    title: 'Video Function Helper',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            inputSchema: zod_1.default.object({
                identifier: zod_1.default.string(),
                functionName: zod_1.default.string(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const videos = this._videoManagerService.getAllVideos();
                const findVideo = videos.find((p) => p.identifier === inputData.identifier &&
                    p.tools.some((p) => p.functionName === inputData.functionName));
                if (!findVideo) {
                    return { error: 'Function not found' };
                }
                const func = await this._moduleRef
                    .get(findVideo.target, { strict: false })[inputData.functionName]();
                return func;
            },
        });
    }
};
exports.VideoFunctionTool = VideoFunctionTool;
exports.VideoFunctionTool = VideoFunctionTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [video_manager_1.VideoManager,
        core_1.ModuleRef])
], VideoFunctionTool);
//# sourceMappingURL=video.function.tool.js.map