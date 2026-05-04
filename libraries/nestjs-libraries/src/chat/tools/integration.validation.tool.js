"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationValidationTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const integration_manager_1 = require("../../integrations/integration.manager");
const validation_schemas_helper_1 = require("../validation.schemas.helper");
const auth_context_1 = require("../auth.context");
let IntegrationValidationTool = class IntegrationValidationTool {
    constructor(_integrationManager) {
        this._integrationManager = _integrationManager;
        this.name = 'integrationSchema';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'integrationSchema',
            description: `Everytime we want to schedule a social media post, we need to understand the schema of the integration.
         This tool helps us get the schema of the integration.
         Sometimes we might get a schema back the requires some id, for that, you can get information from 'tools'
         And use the triggerTool function.
        `,
            mcp: {
                annotations: {
                    title: 'Get Integration Schema',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            inputSchema: zod_1.z.object({
                isPremium: zod_1.z
                    .boolean()
                    .describe('is this the user premium? if not, set to false'),
                platform: zod_1.z
                    .string()
                    .describe(`platform identifier (${integration_manager_1.socialIntegrationList
                    .map((p) => p.identifier)
                    .join(', ')})`),
            }),
            outputSchema: zod_1.z.object({
                output: zod_1.z.object({
                    rules: zod_1.z.string(),
                    maxLength: zod_1.z
                        .number()
                        .describe('The maximum length of a post / comment'),
                    settings: zod_1.z
                        .any()
                        .describe('List of settings need to be passed to schedule a post'),
                    tools: zod_1.z
                        .array(zod_1.z.object({
                        description: zod_1.z.string().describe('Description of the tool'),
                        methodName: zod_1.z
                            .string()
                            .describe('Method to call to get the information'),
                        dataSchema: zod_1.z
                            .array(zod_1.z.object({
                            key: zod_1.z
                                .string()
                                .describe('Name of the settings key to pass'),
                            description: zod_1.z
                                .string()
                                .describe('Description of the setting key'),
                            type: zod_1.z.string(),
                        }))
                            .describe('This will be passed to schedulePostTool [output:settings]'),
                    }))
                        .describe("Sometimes settings require some id, tags and stuff, if you don't have, trigger the `triggerTool` function from the tools list [output:callable-tools]"),
                }),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const integration = integration_manager_1.socialIntegrationList.find((p) => p.identifier === inputData.platform);
                if (!integration) {
                    return {
                        output: { rules: '', maxLength: 0, settings: {}, tools: [] },
                    };
                }
                const maxLength = integration.maxLength(inputData.isPremium);
                const schemas = !integration.dto
                    ? false
                    : (0, validation_schemas_helper_1.getValidationSchemas)()[integration.dto.name];
                const tools = this._integrationManager.getAllTools();
                const rules = this._integrationManager.getAllRulesDescription();
                return {
                    output: {
                        rules: rules[integration.identifier],
                        maxLength,
                        settings: !schemas ? 'No additional settings required' : schemas,
                        tools: tools[integration.identifier],
                    },
                };
            },
        });
    }
};
exports.IntegrationValidationTool = IntegrationValidationTool;
exports.IntegrationValidationTool = IntegrationValidationTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [integration_manager_1.IntegrationManager])
], IntegrationValidationTool);
//# sourceMappingURL=integration.validation.tool.js.map