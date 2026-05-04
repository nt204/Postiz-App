"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateVideoOptionsTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const common_1 = require("@nestjs/common");
const validation_schemas_helper_1 = require("../validation.schemas.helper");
const video_manager_1 = require("../../videos/video.manager");
const zod_1 = tslib_1.__importDefault(require("zod"));
const auth_context_1 = require("../auth.context");
let GenerateVideoOptionsTool = class GenerateVideoOptionsTool {
    constructor(_videoManagerService) {
        this._videoManagerService = _videoManagerService;
        this.name = 'generateVideoOptions';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'generateVideoOptions',
            description: `All the options to generate videos, some tools might require another call to generateVideoFunction`,
            inputSchema: zod_1.default.object({}),
            mcp: {
                annotations: {
                    title: 'List Video Generation Options',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            outputSchema: zod_1.default.object({
                video: zod_1.default.array(zod_1.default.object({
                    type: zod_1.default.string(),
                    output: zod_1.default.string(),
                    tools: zod_1.default.array(zod_1.default.object({
                        functionName: zod_1.default.string(),
                        output: zod_1.default.string(),
                    })),
                    customParams: zod_1.default.any(),
                })),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const videos = this._videoManagerService.getAllVideos();
                console.log(JSON.stringify({
                    video: videos.map((p) => {
                        return {
                            type: p.identifier,
                            output: 'vertical|horizontal',
                            tools: p.tools,
                            customParams: (0, validation_schemas_helper_1.getValidationSchemas)()[p.dto.name],
                        };
                    }),
                }, null, 2));
                return {
                    video: videos.map((p) => {
                        return {
                            type: p.identifier,
                            output: 'vertical|horizontal',
                            tools: p.tools,
                            customParams: (0, validation_schemas_helper_1.getValidationSchemas)()[p.dto.name],
                        };
                    }),
                };
            },
        });
    }
};
exports.GenerateVideoOptionsTool = GenerateVideoOptionsTool;
exports.GenerateVideoOptionsTool = GenerateVideoOptionsTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [video_manager_1.VideoManager])
], GenerateVideoOptionsTool);
//# sourceMappingURL=generate.video.options.tool.js.map