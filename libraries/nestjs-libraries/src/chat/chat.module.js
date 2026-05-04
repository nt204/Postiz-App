"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const load_tools_service_1 = require("./load.tools.service");
const mastra_service_1 = require("./mastra.service");
const tool_list_1 = require("./tools/tool.list");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [mastra_service_1.MastraService, load_tools_service_1.LoadToolsService, ...tool_list_1.toolList],
        get exports() {
            return this.providers;
        },
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map