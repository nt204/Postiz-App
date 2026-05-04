"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdPartyModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const heygen_provider_1 = require("./heygen/heygen.provider");
const reelfarm_provider_1 = require("./reelfarm/reelfarm.provider");
const thirdparty_manager_1 = require("./thirdparty.manager");
let ThirdPartyModule = class ThirdPartyModule {
};
exports.ThirdPartyModule = ThirdPartyModule;
exports.ThirdPartyModule = ThirdPartyModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [heygen_provider_1.HeygenProvider, reelfarm_provider_1.ReelFarmProvider, thirdparty_manager_1.ThirdPartyManager],
        get exports() {
            return this.providers;
        },
    })
], ThirdPartyModule);
//# sourceMappingURL=thirdparty.module.js.map