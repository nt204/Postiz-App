"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveOAuthDto = exports.AuthorizeOAuthQueryDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class AuthorizeOAuthQueryDto {
}
exports.AuthorizeOAuthQueryDto = AuthorizeOAuthQueryDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "client_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsIn)(['code']),
    tslib_1.__metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "response_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "state", void 0);
class ApproveOAuthDto {
}
exports.ApproveOAuthDto = ApproveOAuthDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], ApproveOAuthDto.prototype, "client_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], ApproveOAuthDto.prototype, "state", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsIn)(['approve', 'deny']),
    tslib_1.__metadata("design:type", String)
], ApproveOAuthDto.prototype, "action", void 0);
//# sourceMappingURL=authorize-oauth.dto.js.map