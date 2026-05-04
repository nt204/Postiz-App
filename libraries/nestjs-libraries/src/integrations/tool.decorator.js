"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tool = Tool;
require("reflect-metadata");
function Tool(params) {
    return function (target, propertyKey) {
        const existingMetadata = Reflect.getMetadata('custom:tool', target) || [];
        existingMetadata.push({ methodName: propertyKey, ...params });
        Reflect.defineMetadata('custom:tool', existingMetadata, target);
    };
}
//# sourceMappingURL=tool.decorator.js.map