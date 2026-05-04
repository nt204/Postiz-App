"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationTriggerTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const integration_manager_1 = require("../../integrations/integration.manager");
const integration_service_1 = require("../../database/prisma/integrations/integration.service");
const social_abstract_1 = require("../../integrations/social.abstract");
const timer_1 = require("../../../../helpers/src/utils/timer");
const auth_context_1 = require("../auth.context");
const refresh_integration_service_1 = require("../../integrations/refresh.integration.service");
let IntegrationTriggerTool = class IntegrationTriggerTool {
    constructor(_integrationManager, _integrationService, _refreshIntegrationService) {
        this._integrationManager = _integrationManager;
        this._integrationService = _integrationService;
        this._refreshIntegrationService = _refreshIntegrationService;
        this.name = 'triggerTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'triggerTool',
            description: `After using the integrationSchema, we sometimes miss details we can\'t ask from the user, like ids.
      Sometimes this tool requires to user prompt for some settings, like a word to search for. methodName is required [input:callable-tools]`,
            mcp: {
                annotations: {
                    title: 'Trigger Integration Tool',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
            },
            inputSchema: zod_1.z.object({
                integrationId: zod_1.z.string().describe('The id of the integration'),
                methodName: zod_1.z
                    .string()
                    .describe('The methodName from the `integrationSchema` functions in the tools array, required'),
                dataSchema: zod_1.z.array(zod_1.z.object({
                    key: zod_1.z.string().describe('Name of the settings key to pass'),
                    value: zod_1.z.string().describe('Value of the key'),
                })),
            }),
            outputSchema: zod_1.z.object({
                output: zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.any())),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                console.log('triggerTool', inputData);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                const getIntegration = await this._integrationService.getIntegrationById(organizationId, inputData.integrationId);
                if (!getIntegration) {
                    return {
                        output: 'Integration not found',
                    };
                }
                const integrationProvider = integration_manager_1.socialIntegrationList.find((p) => p.identifier === getIntegration.providerIdentifier);
                if (!integrationProvider) {
                    return {
                        output: 'Integration not found',
                    };
                }
                const tools = this._integrationManager.getAllTools();
                if (!tools[integrationProvider.identifier].some((p) => p.methodName === inputData.methodName) ||
                    !integrationProvider[inputData.methodName]) {
                    return { output: 'tool not found' };
                }
                while (true) {
                    try {
                        const load = await integrationProvider[inputData.methodName](getIntegration.token, inputData.dataSchema.reduce((all, current) => ({
                            ...all,
                            [current.key]: current.value,
                        }), {}), getIntegration.internalId, getIntegration);
                        return { output: load };
                    }
                    catch (err) {
                        if (err instanceof social_abstract_1.RefreshToken) {
                            const data = await this._refreshIntegrationService.refresh(getIntegration);
                            if (!data) {
                                await this._integrationService.disconnectChannel(organizationId, getIntegration);
                                return {
                                    output: 'We had to disconnect the channel as the token expired',
                                };
                            }
                            const { accessToken } = data;
                            if (accessToken) {
                                getIntegration.token = accessToken;
                                if (integrationProvider.refreshWait) {
                                    await (0, timer_1.timer)(10000);
                                }
                                continue;
                            }
                            else {
                            }
                        }
                        return { output: 'Unexpected error' };
                    }
                }
            },
        });
    }
};
exports.IntegrationTriggerTool = IntegrationTriggerTool;
exports.IntegrationTriggerTool = IntegrationTriggerTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [integration_manager_1.IntegrationManager,
        integration_service_1.IntegrationService,
        refresh_integration_service_1.RefreshIntegrationService])
], IntegrationTriggerTool);
//# sourceMappingURL=integration.trigger.tool.js.map