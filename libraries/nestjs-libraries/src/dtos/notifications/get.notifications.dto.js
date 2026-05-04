"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNotificationsDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GetNotificationsDto {
    constructor() {
        this.page = 0;
    }
}
exports.GetNotificationsDto = GetNotificationsDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    tslib_1.__metadata("design:type", Number)
], GetNotificationsDto.prototype, "page", void 0);
//# sourceMappingURL=get.notifications.dto.js.map