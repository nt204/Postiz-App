"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfiniteWorkflowRegisterModule = exports.InfiniteWorkflowRegister = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
let InfiniteWorkflowRegister = class InfiniteWorkflowRegister {
    constructor(_temporalService) {
        this._temporalService = _temporalService;
    }
    async onModuleInit() {
        if (!!process.env.RUN_CRON) {
            try {
                await this._temporalService.client
                    ?.getRawClient()
                    ?.workflow?.start('missingPostWorkflow', {
                    workflowId: 'missing-post-workflow',
                    taskQueue: 'main',
                });
            }
            catch (err) { }
        }
    }
};
exports.InfiniteWorkflowRegister = InfiniteWorkflowRegister;
exports.InfiniteWorkflowRegister = InfiniteWorkflowRegister = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [nestjs_temporal_core_1.TemporalService])
], InfiniteWorkflowRegister);
let InfiniteWorkflowRegisterModule = class InfiniteWorkflowRegisterModule {
};
exports.InfiniteWorkflowRegisterModule = InfiniteWorkflowRegisterModule;
exports.InfiniteWorkflowRegisterModule = InfiniteWorkflowRegisterModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [],
        controllers: [],
        providers: [InfiniteWorkflowRegister],
        get exports() {
            return this.providers;
        },
    })
], InfiniteWorkflowRegisterModule);
//# sourceMappingURL=infinite.workflow.register.js.map