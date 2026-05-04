"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const valid_url_path_1 = require("../../../../helpers/src/utils/valid.url.path");
const webhook_url_validator_1 = require("../webhooks/webhook.url.validator");
class UploadDto {
}
exports.UploadDto = UploadDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.Validate)(valid_url_path_1.ValidUrlExtension),
    (0, webhook_url_validator_1.IsSafeWebhookUrl)({
        message: 'URL must be a public HTTPS URL and cannot point to internal network addresses',
    }),
    tslib_1.__metadata("design:type", String)
], UploadDto.prototype, "url", void 0);
//# sourceMappingURL=upload.dto.js.map