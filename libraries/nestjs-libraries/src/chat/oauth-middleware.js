"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOAuthMiddleware = createOAuthMiddleware;
exports.createStaticTokenValidator = createStaticTokenValidator;
exports.createIntrospectionValidator = createIntrospectionValidator;
const oauth_types_1 = require("./oauth-types");
function createOAuthMiddleware(options) {
    const { oauth, mcpPath = '/mcp', logger } = options;
    const protectedResourceMetadata = (0, oauth_types_1.generateProtectedResourceMetadata)(oauth);
    const wellKnownPath = '/.well-known/oauth-protected-resource';
    const resourceMetadataUrl = new URL(wellKnownPath, oauth.resource).toString();
    return async function oauthMiddleware(req, res, url) {
        logger?.debug?.(`OAuth middleware: ${req.method} ${url.pathname}`);
        if (url.pathname === wellKnownPath && req.method === 'GET') {
            logger?.debug?.('OAuth middleware: Serving Protected Resource Metadata');
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'max-age=3600',
                'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify(protectedResourceMetadata));
            return { proceed: false, handled: true };
        }
        if (url.pathname === wellKnownPath && req.method === 'OPTIONS') {
            res.writeHead(204, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            });
            res.end();
            return { proceed: false, handled: true };
        }
        if (!url.pathname.startsWith(mcpPath)) {
            return { proceed: true, handled: false };
        }
        const authHeader = req.headers['authorization'];
        const token = (0, oauth_types_1.extractBearerToken)(authHeader);
        if (!token) {
            logger?.debug?.('OAuth middleware: No bearer token provided');
            res.writeHead(401, {
                'Content-Type': 'application/json',
                'WWW-Authenticate': (0, oauth_types_1.generateWWWAuthenticateHeader)({ resourceMetadataUrl }),
            });
            res.end(JSON.stringify({
                error: 'unauthorized',
                error_description: 'Bearer token required',
            }));
            return { proceed: false, handled: true };
        }
        if (oauth.validateToken) {
            logger?.debug?.('OAuth middleware: Validating token');
            const validationResult = await oauth.validateToken(token, oauth.resource);
            if (!validationResult.valid) {
                logger?.debug?.(`OAuth middleware: Token validation failed: ${validationResult.error}`);
                res.writeHead(401, {
                    'Content-Type': 'application/json',
                    'WWW-Authenticate': (0, oauth_types_1.generateWWWAuthenticateHeader)({
                        resourceMetadataUrl,
                        additionalParams: {
                            error: validationResult.error || 'invalid_token',
                            ...(validationResult.errorDescription && {
                                error_description: validationResult.errorDescription,
                            }),
                        },
                    }),
                });
                res.end(JSON.stringify({
                    error: validationResult.error || 'invalid_token',
                    error_description: validationResult.errorDescription || 'Token validation failed',
                }));
                return { proceed: false, handled: true, tokenValidation: validationResult };
            }
            logger?.debug?.('OAuth middleware: Token validated successfully');
            return { proceed: true, handled: false, tokenValidation: validationResult };
        }
        logger?.debug?.('OAuth middleware: No token validation configured, accepting token');
        return {
            proceed: true,
            handled: false,
            tokenValidation: { valid: true },
        };
    };
}
function createStaticTokenValidator(validTokens) {
    const tokenSet = new Set(validTokens);
    return async (token) => {
        if (tokenSet.has(token)) {
            return { valid: true, scopes: ['mcp:read', 'mcp:write'] };
        }
        return {
            valid: false,
            error: 'invalid_token',
            errorDescription: 'Token not recognized',
        };
    };
}
function createIntrospectionValidator(introspectionEndpoint, clientCredentials) {
    return async (token, resource) => {
        try {
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            if (clientCredentials) {
                if (clientCredentials.clientId.includes(':')) {
                    return {
                        valid: false,
                        error: 'invalid_request',
                        errorDescription: 'clientId cannot contain a colon character per RFC 7617',
                    };
                }
                const credentials = Buffer.from(`${clientCredentials.clientId}:${clientCredentials.clientSecret}`).toString('base64');
                headers['Authorization'] = `Basic ${credentials}`;
            }
            const response = await fetch(introspectionEndpoint, {
                method: 'POST',
                headers,
                body: new URLSearchParams({
                    token,
                    token_type_hint: 'access_token',
                }),
            });
            if (!response.ok) {
                return {
                    valid: false,
                    error: 'server_error',
                    errorDescription: `Introspection failed: ${response.status}`,
                };
            }
            const data = (await response.json());
            if (!data.active) {
                return {
                    valid: false,
                    error: 'invalid_token',
                    errorDescription: 'Token is not active',
                };
            }
            if (data.aud) {
                const audiences = Array.isArray(data.aud) ? data.aud : [data.aud];
                if (!audiences.includes(resource)) {
                    return {
                        valid: false,
                        error: 'invalid_token',
                        errorDescription: 'Token audience does not match this resource',
                    };
                }
            }
            return {
                valid: true,
                scopes: data.scope
                    ?.trim()
                    .split(' ')
                    .filter(s => s !== '') || [],
                subject: data.sub,
                expiresAt: data.exp,
                claims: data,
            };
        }
        catch (error) {
            return {
                valid: false,
                error: 'server_error',
                errorDescription: error instanceof Error ? error.message : 'Introspection failed',
            };
        }
    };
}
//# sourceMappingURL=oauth-middleware.js.map