"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomFileValidationPipe = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const { fromBuffer } = require('file-type');
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/bmp',
    'image/tiff',
    'video/mp4',
]);
let CustomFileValidationPipe = class CustomFileValidationPipe {
    async transform(value) {
        if (!value || typeof value !== 'object') {
            return value;
        }
        if (!('buffer' in value) && !('mimetype' in value) && !('fieldname' in value)) {
            return value;
        }
        if (!value.buffer || !Buffer.isBuffer(value.buffer)) {
            throw new common_1.BadRequestException('Invalid file upload.');
        }
        const detected = await fromBuffer(value.buffer);
        if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
            throw new common_1.BadRequestException('Unsupported file type.');
        }
        const maxSize = this.getMaxSize(detected.mime);
        if (value.size > maxSize) {
            throw new common_1.BadRequestException(`File size exceeds the maximum allowed size of ${maxSize} bytes.`);
        }
        value.mimetype = detected.mime;
        const safeBase = (value.originalname || 'upload')
            .replace(/\.[^./\\]*$/, '')
            .replace(/[\\/]/g, '_')
            .slice(0, 100) || 'upload';
        value.originalname = `${safeBase}.${detected.ext}`;
        return value;
    }
    getMaxSize(mimeType) {
        if (mimeType.startsWith('image/')) {
            return 10 * 1024 * 1024;
        }
        else if (mimeType.startsWith('video/')) {
            return 1024 * 1024 * 1024;
        }
        else {
            throw new common_1.BadRequestException('Unsupported file type.');
        }
    }
};
exports.CustomFileValidationPipe = CustomFileValidationPipe;
exports.CustomFileValidationPipe = CustomFileValidationPipe = tslib_1.__decorate([
    (0, common_1.Injectable)()
], CustomFileValidationPipe);
//# sourceMappingURL=custom.upload.validation.js.map