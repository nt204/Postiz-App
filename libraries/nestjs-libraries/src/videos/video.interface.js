"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoAbstract = void 0;
exports.ExposeVideoFunction = ExposeVideoFunction;
exports.Video = Video;
const common_1 = require("@nestjs/common");
class VideoAbstract {
    async processAndValidate(customParams) {
        const validationPipe = new common_1.ValidationPipe({
            skipMissingProperties: false,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        });
        await validationPipe.transform(customParams, {
            type: 'body',
            metatype: this.dto,
        });
    }
}
exports.VideoAbstract = VideoAbstract;
function ExposeVideoFunction(description) {
    return function (target, propertyKey, descriptor) {
        Reflect.defineMetadata('video-function', description || 'true', descriptor.value);
    };
}
function Video(params) {
    return function (target) {
        (0, common_1.Injectable)()(target);
        const existingMetadata = Reflect.getMetadata('video', VideoAbstract) || [];
        existingMetadata.push({ target, ...params });
        Reflect.defineMetadata('video', existingMetadata, VideoAbstract);
    };
}
//# sourceMappingURL=video.interface.js.map