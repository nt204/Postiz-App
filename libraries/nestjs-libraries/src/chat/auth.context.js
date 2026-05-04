"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const async_storage_1 = require("./async.storage");
const checkAuth = (inputData, context) => {
    const auth = (0, async_storage_1.getAuth)();
    const authInfo = context?.mcp?.extra?.authInfo || auth;
    if (authInfo && context?.requestContext) {
        context.requestContext.set('organization', JSON.stringify(authInfo));
        context.requestContext.set('ui', 'false');
    }
};
exports.checkAuth = checkAuth;
//# sourceMappingURL=auth.context.js.map