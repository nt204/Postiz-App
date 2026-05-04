"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePostContent = void 0;
const tslib_1 = require("tslib");
const isomorphic_dompurify_1 = tslib_1.__importDefault(require("isomorphic-dompurify"));
const ALLOWED_TAGS = [
    'p',
    'br',
    'strong',
    'u',
    'a',
    'ul',
    'li',
    'h1',
    'h2',
    'h3',
    'span',
];
const ALLOWED_ATTR = [
    'href',
    'target',
    'rel',
    'class',
    'data-mention-id',
    'data-mention-label',
];
const sanitizePostContent = (value) => {
    if (typeof value !== 'string' || !value) {
        return '';
    }
    return isomorphic_dompurify_1.default.sanitize(value, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/|#)/i,
    });
};
exports.sanitizePostContent = sanitizePostContent;
//# sourceMappingURL=sanitize.post.content.js.map