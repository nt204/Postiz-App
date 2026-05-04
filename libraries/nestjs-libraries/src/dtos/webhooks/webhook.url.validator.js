"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsSafeWebhookUrlConstraint = void 0;
exports.isBlockedIPv4 = isBlockedIPv4;
exports.isBlockedIPv6 = isBlockedIPv6;
exports.isBlockedIp = isBlockedIp;
exports.isSafePublicHttpsUrl = isSafePublicHttpsUrl;
exports.IsSafeWebhookUrl = IsSafeWebhookUrl;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const node_url_1 = require("node:url");
const promises_1 = tslib_1.__importDefault(require("node:dns/promises"));
const node_net_1 = tslib_1.__importDefault(require("node:net"));
function isBlockedIPv4(ip) {
    const [a, b] = ip.split('.').map(Number);
    if ([a, b].some((n) => Number.isNaN(n)))
        return true;
    return (a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 198 && (b === 18 || b === 19)) ||
        a >= 224);
}
function isBlockedIPv6(ip) {
    const normalized = ip.toLowerCase();
    return (normalized === '::1' ||
        normalized === '::' ||
        normalized.startsWith('fe80:') ||
        normalized.startsWith('fc') ||
        normalized.startsWith('fd') ||
        normalized.startsWith('ff'));
}
function isBlockedIp(ip) {
    const version = node_net_1.default.isIP(ip);
    if (version === 4) {
        return isBlockedIPv4(ip);
    }
    if (version === 6) {
        const mapped = ip.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
        if (mapped) {
            return isBlockedIPv4(mapped[1]);
        }
        return isBlockedIPv6(ip);
    }
    return true;
}
async function isSafePublicHttpsUrl(value) {
    if (typeof value !== 'string' || !value.trim()) {
        return false;
    }
    let parsed;
    try {
        parsed = new node_url_1.URL(value);
    }
    catch {
        return false;
    }
    if (parsed.protocol !== 'https:') {
        return false;
    }
    if (!parsed.hostname) {
        return false;
    }
    const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (hostname === 'localhost') {
        return false;
    }
    const literalIpVersion = node_net_1.default.isIP(hostname);
    if (literalIpVersion) {
        return !isBlockedIp(hostname);
    }
    try {
        const records = await promises_1.default.lookup(hostname, { all: true });
        if (!records.length) {
            return false;
        }
        for (const record of records) {
            if (isBlockedIp(record.address)) {
                return false;
            }
        }
        return true;
    }
    catch {
        return false;
    }
}
let IsSafeWebhookUrlConstraint = class IsSafeWebhookUrlConstraint {
    async validate(value, _args) {
        return isSafePublicHttpsUrl(value);
    }
    defaultMessage(_args) {
        return 'URL must be a public HTTPS URL and must not resolve to localhost, private, loopback, or link-local addresses';
    }
};
exports.IsSafeWebhookUrlConstraint = IsSafeWebhookUrlConstraint;
exports.IsSafeWebhookUrlConstraint = IsSafeWebhookUrlConstraint = tslib_1.__decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'IsSafeWebhookUrl', async: true })
], IsSafeWebhookUrlConstraint);
function IsSafeWebhookUrl(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsSafeWebhookUrlConstraint,
        });
    };
}
//# sourceMappingURL=webhook.url.validator.js.map