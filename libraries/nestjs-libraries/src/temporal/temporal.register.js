"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporalRegisterMissingSearchAttributesModule = exports.TemporalRegister = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
let TemporalRegister = class TemporalRegister {
    constructor(_client) {
        this._client = _client;
    }
    async onModuleInit() {
        if (process.env.TEMPORAL_TLS === 'true') {
            return;
        }
        const connection = this._client?.client?.getRawClient()
            ?.connection;
        if (!connection?.operatorService) {
            return;
        }
        try {
            const { customAttributes } = await connection.operatorService.listSearchAttributes({
                namespace: process.env.TEMPORAL_NAMESPACE || 'default',
            });
            const neededAttribute = ['organizationId', 'postId'];
            const missingAttributes = neededAttribute.filter((attr) => !customAttributes[attr]);
            if (missingAttributes.length > 0) {
                await connection.operatorService.addSearchAttributes({
                    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
                    searchAttributes: missingAttributes.reduce((all, current) => {
                        all[current] = 1;
                        return all;
                    }, {}),
                });
            }
        }
        catch {
            return;
        }
    }
};
exports.TemporalRegister = TemporalRegister;
exports.TemporalRegister = TemporalRegister = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [nestjs_temporal_core_1.TemporalService])
], TemporalRegister);
let TemporalRegisterMissingSearchAttributesModule = class TemporalRegisterMissingSearchAttributesModule {
};
exports.TemporalRegisterMissingSearchAttributesModule = TemporalRegisterMissingSearchAttributesModule;
exports.TemporalRegisterMissingSearchAttributesModule = TemporalRegisterMissingSearchAttributesModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [],
        controllers: [],
        providers: [TemporalRegister],
        get exports() {
            return this.providers;
        },
    })
], TemporalRegisterMissingSearchAttributesModule);
//# sourceMappingURL=temporal.register.js.map