"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportMediaDto = exports.ImportMediaItemDto = void 0;
const tslib_1 = require("tslib");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const webhook_url_validator_1 = require("../webhooks/webhook.url.validator");
class ImportMediaItemDto {
}
exports.ImportMediaItemDto = ImportMediaItemDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    (0, webhook_url_validator_1.IsSafeWebhookUrl)({
        message: 'URL must be a public HTTPS URL and cannot point to internal network addresses',
    }),
    tslib_1.__metadata("design:type", String)
], ImportMediaItemDto.prototype, "url", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], ImportMediaItemDto.prototype, "name", void 0);
class ImportMediaDto {
}
exports.ImportMediaDto = ImportMediaDto;
tslib_1.__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ImportMediaItemDto),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", Array)
], ImportMediaDto.prototype, "items", void 0);
//# sourceMappingURL=import-media.dto.js.map