"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePostStatusDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class ChangePostStatusDto {
}
exports.ChangePostStatusDto = ChangePostStatusDto;
tslib_1.__decorate([
    (0, class_validator_1.IsIn)(['draft', 'schedule']),
    tslib_1.__metadata("design:type", String)
], ChangePostStatusDto.prototype, "status", void 0);
//# sourceMappingURL=change.post.status.dto.js.map