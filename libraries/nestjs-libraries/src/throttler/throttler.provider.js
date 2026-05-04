"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlerBehindProxyGuard = void 0;
const tslib_1 = require("tslib");
const throttler_1 = require("@nestjs/throttler");
const common_1 = require("@nestjs/common");
let ThrottlerBehindProxyGuard = class ThrottlerBehindProxyGuard extends throttler_1.ThrottlerGuard {
    async canActivate(context) {
        const { url, method } = context.switchToHttp().getRequest();
        if (method === 'POST' && url.includes('/public/v1/posts')) {
            return super.canActivate(context);
        }
        return true;
    }
    async getTracker(req) {
        return (req.org.id + '_' + (req.url.indexOf('/posts') > -1 ? 'posts' : 'other'));
    }
};
exports.ThrottlerBehindProxyGuard = ThrottlerBehindProxyGuard;
exports.ThrottlerBehindProxyGuard = ThrottlerBehindProxyGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], ThrottlerBehindProxyGuard);
//# sourceMappingURL=throttler.provider.js.map