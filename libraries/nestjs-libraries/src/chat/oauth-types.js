"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWWWAuthenticateHeader = generateWWWAuthenticateHeader;
exports.generateProtectedResourceMetadata = generateProtectedResourceMetadata;
exports.extractBearerToken = extractBearerToken;
function escapeHeaderValue(value) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
function generateWWWAuthenticateHeader(options = {}) {
    const params = [];
    if (options.resourceMetadataUrl) {
        params.push(`resource_metadata="${escapeHeaderValue(options.resourceMetadataUrl)}"`);
    }
    if (options.additionalParams) {
        for (const [key, value] of Object.entries(options.additionalParams)) {
            params.push(`${key}="${escapeHeaderValue(value)}"`);
        }
    }
    if (params.length === 0) {
        return 'Bearer';
    }
    return `Bearer ${params.join(', ')}`;
}
function generateProtectedResourceMetadata(config) {
    return {
        resource: config.resource,
        authorization_servers: config.authorizationServers,
        scopes_supported: config.scopesSupported ?? ['mcp:read', 'mcp:write'],
        bearer_methods_supported: ['header'],
        ...(config.resourceName && { resource_name: config.resourceName }),
        ...(config.resourceDocumentation && {
            resource_documentation: config.resourceDocumentation,
        }),
    };
}
function extractBearerToken(authHeader) {
    if (!authHeader)
        return undefined;
    const prefix = 'bearer ';
    if (authHeader.length <= prefix.length)
        return undefined;
    if (authHeader.slice(0, prefix.length).toLowerCase() !== prefix)
        return undefined;
    const token = authHeader.slice(prefix.length).trim();
    return token || undefined;
}
//# sourceMappingURL=oauth-types.js.map