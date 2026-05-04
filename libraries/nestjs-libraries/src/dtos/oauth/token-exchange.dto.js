"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenExchangeDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class TokenExchangeDto {
}
exports.TokenExchangeDto = TokenExchangeDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], TokenExchangeDto.prototype, "grant_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], TokenExchangeDto.prototype, "code", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], TokenExchangeDto.prototype, "client_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], TokenExchangeDto.prototype, "client_secret", void 0);
//# sourceMappingURL=token-exchange.dto.js.map