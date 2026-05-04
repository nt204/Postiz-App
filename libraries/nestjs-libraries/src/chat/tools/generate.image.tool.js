"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateImageTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const media_service_1 = require("../../database/prisma/media/media.service");
const upload_factory_1 = require("../../upload/upload.factory");
const auth_context_1 = require("../auth.context");
let GenerateImageTool = class GenerateImageTool {
    constructor(_mediaService) {
        this._mediaService = _mediaService;
        this.storage = upload_factory_1.UploadFactory.createStorage();
        this.name = 'generateImageTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'generateImageTool',
            description: `Generate image to use in a post,
                    in case the user specified a platform that requires attachment and attachment was not provided,
                    ask if they want to generate a picture of a video.
      `,
            mcp: {
                annotations: {
                    title: 'Generate Image',
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
            },
            inputSchema: zod_1.z.object({
                prompt: zod_1.z.string(),
            }),
            outputSchema: zod_1.z.object({
                id: zod_1.z.string(),
                path: zod_1.z.string(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const org = JSON.parse(context?.requestContext?.get('organization'));
                const image = await this._mediaService.generateImage(inputData.prompt, org);
                const file = await this.storage.uploadSimple('data:image/png;base64,' + image);
                return this._mediaService.saveFile(org.id, file.split('/').pop(), file);
            },
        });
    }
};
exports.GenerateImageTool = GenerateImageTool;
exports.GenerateImageTool = GenerateImageTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [media_service_1.MediaService])
], GenerateImageTool);
//# sourceMappingURL=generate.image.tool.js.map