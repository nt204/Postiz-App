"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortlinkPreferenceDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class ShortlinkPreferenceDto {
}
exports.ShortlinkPreferenceDto = ShortlinkPreferenceDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.ShortLinkPreference),
    tslib_1.__metadata("design:type", String)
], ShortlinkPreferenceDto.prototype, "shortlink", void 0);
//# sourceMappingURL=shortlink-preference.dto.js.map