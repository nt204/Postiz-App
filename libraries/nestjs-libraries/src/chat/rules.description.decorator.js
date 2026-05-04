"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rules = Rules;
require("reflect-metadata");
function Rules(description) {
    return function (target) {
        Reflect.defineMetadata('custom:rules:description', description, target);
    };
}
//# sourceMappingURL=rules.description.decorator.js.map