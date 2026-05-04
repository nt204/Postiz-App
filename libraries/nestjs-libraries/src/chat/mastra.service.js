"use strict";
var MastraService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MastraService = void 0;
const tslib_1 = require("tslib");
const mastra_1 = require("@mastra/core/mastra");
const logger_1 = require("@mastra/core/logger");
const mastra_store_1 = require("./mastra.store");
const common_1 = require("@nestjs/common");
const load_tools_service_1 = require("./load.tools.service");
let MastraService = MastraService_1 = class MastraService {
    constructor(_loadToolsService) {
        this._loadToolsService = _loadToolsService;
    }
    async mastra() {
        MastraService_1.mastra =
            MastraService_1.mastra ||
                new mastra_1.Mastra({
                    storage: mastra_store_1.pStore,
                    agents: {
                        postiz: await this._loadToolsService.agent(),
                    },
                    logger: new logger_1.ConsoleLogger({
                        level: 'info',
                    }),
                });
        return MastraService_1.mastra;
    }
};
exports.MastraService = MastraService;
exports.MastraService = MastraService = MastraService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [load_tools_service_1.LoadToolsService])
], MastraService);
//# sourceMappingURL=mastra.service.js.map