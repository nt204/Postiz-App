"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationListTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const common_1 = require("@nestjs/common");
const integration_service_1 = require("../../database/prisma/integrations/integration.service");
const zod_1 = tslib_1.__importDefault(require("zod"));
const auth_context_1 = require("../auth.context");
let IntegrationListTool = class IntegrationListTool {
    constructor(_integrationService) {
        this._integrationService = _integrationService;
        this.name = 'integrationList';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'integrationList',
            description: `This tool list available integrations to schedule posts to`,
            inputSchema: zod_1.default.object({}),
            mcp: {
                annotations: {
                    title: 'List Integrations',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            outputSchema: zod_1.default.object({
                output: zod_1.default.array(zod_1.default.object({
                    id: zod_1.default.string(),
                    name: zod_1.default.string(),
                    picture: zod_1.default.string(),
                    platform: zod_1.default.string(),
                })),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                return {
                    output: (await this._integrationService.getIntegrationsList(organizationId)).map((p) => ({
                        name: p.name,
                        id: p.id,
                        disabled: p.disabled,
                        picture: p.picture || '/no-picture.jpg',
                        platform: p.providerIdentifier,
                        display: p.profile,
                        type: p.type,
                    })),
                };
            },
        });
    }
};
exports.IntegrationListTool = IntegrationListTool;
exports.IntegrationListTool = IntegrationListTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [integration_service_1.IntegrationService])
], IntegrationListTool);
//# sourceMappingURL=integration.list.tool.js.map