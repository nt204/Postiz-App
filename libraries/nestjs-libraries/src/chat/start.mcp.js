"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMcp = void 0;
const mastra_service_1 = require("./mastra.service");
const mcp_1 = require("@mastra/mcp");
const crypto_1 = require("crypto");
const organization_service_1 = require("../database/prisma/organizations/organization.service");
const oauth_service_1 = require("../database/prisma/oauth/oauth.service");
const async_storage_1 = require("./async.storage");
const oauth_middleware_1 = require("./oauth-middleware");
const fixAcceptHeader = (req) => {
    const value = 'application/json, text/event-stream';
    req.headers.accept = value;
    const idx = req.rawHeaders.findIndex((h) => h.toLowerCase() === 'accept');
    if (idx !== -1) {
        req.rawHeaders[idx + 1] = value;
    }
    else {
        req.rawHeaders.push('Accept', value);
    }
};
const startMcp = async (app) => {
    const mastraService = app.get(mastra_service_1.MastraService, { strict: false });
    const organizationService = app.get(organization_service_1.OrganizationService, { strict: false });
    const oauthService = app.get(oauth_service_1.OAuthService, { strict: false });
    const resolveAuth = async (token) => {
        if (token.startsWith('pos_')) {
            const authorization = await oauthService.getOrgByOAuthToken(token);
            if (!authorization)
                return null;
            return authorization.organization;
        }
        return organizationService.getOrgByApiKey(token);
    };
    const mastra = await mastraService.mastra();
    const agent = mastra.getAgent('postiz');
    const tools = await agent.listTools();
    const serverConfig = {
        name: 'Postiz MCP',
        version: '1.0.0',
        tools,
        agents: { postiz: agent },
    };
    const server = new mcp_1.MCPServer(serverConfig);
    const oauthMiddleware = (0, oauth_middleware_1.createOAuthMiddleware)({
        oauth: {
            resource: new URL('/mcp-oauth', process.env.NEXT_PUBLIC_BACKEND_URL).toString(),
            authorizationServers: [process.env.NEXT_PUBLIC_BACKEND_URL],
            validateToken: async (token) => {
                const org = await resolveAuth(token);
                if (!org) {
                    return { valid: false, error: 'invalid_token', errorDescription: 'Invalid API Key or OAuth token' };
                }
                return { valid: true, subject: token };
            },
        },
        mcpPath: '/mcp-oauth',
    });
    if (process.env.OPENAI_APP_CHALLANGE) {
        app.use('/.well-known/openai-apps-challenge', (req, res) => {
            res.setHeader('Content-Type', 'text/plain');
            res.send(process.env.OPENAI_APP_CHALLANGE);
        });
    }
    app.use('/.well-known/oauth-protected-resource', async (req, res) => {
        const url = new URL('/.well-known/oauth-protected-resource', process.env.NEXT_PUBLIC_BACKEND_URL);
        await oauthMiddleware(req, res, url);
    });
    app.use('/.well-known/oauth-authorization-server', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.writeHead(204);
            res.end();
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'max-age=3600');
        res.json({
            issuer: process.env.NEXT_PUBLIC_BACKEND_URL,
            authorization_endpoint: `${process.env.FRONTEND_URL}/oauth/authorize`,
            token_endpoint: `${process.env.NEXT_PUBLIC_OVERRIDE_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/token`,
            response_types_supported: ['code'],
            grant_types_supported: ['authorization_code'],
            code_challenge_methods_supported: ['S256'],
            scopes_supported: ['mcp:read', 'mcp:write'],
        });
    });
    app.use('/mcp-oauth', async (req, res, next) => {
        if (req.path !== '/' && req.path !== '') {
            next();
            return;
        }
        const url = new URL('/mcp-oauth', process.env.NEXT_PUBLIC_BACKEND_URL);
        const result = await oauthMiddleware(req, res, url);
        if (!result.proceed)
            return;
        const token = result.tokenValidation?.subject;
        const auth = await resolveAuth(token);
        if (!auth) {
            res.status(401).json({ error: 'invalid_token', error_description: 'Could not resolve organization' });
            return;
        }
        fixAcceptHeader(req);
        await (0, async_storage_1.runWithContext)({ requestId: token, auth }, async () => {
            await server.startHTTP({
                url: url,
                httpPath: url.pathname,
                options: {
                    sessionIdGenerator: () => {
                        return (0, crypto_1.randomUUID)();
                    },
                    enableJsonResponse: true,
                },
                req,
                res,
            });
        });
    });
    app.use('/mcp', async (req, res, next) => {
        if (req.path !== '/' && req.path !== '') {
            next();
            return;
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Expose-Headers', '*');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).send('Missing Authorization header');
            return;
        }
        req.auth = await resolveAuth(token);
        if (!req.auth) {
            res.status(401).send('Invalid API Key or OAuth token');
            return;
        }
        const url = new URL('/mcp', process.env.NEXT_PUBLIC_BACKEND_URL);
        fixAcceptHeader(req);
        await (0, async_storage_1.runWithContext)({ requestId: token, auth: req.auth }, async () => {
            await server.startHTTP({
                url,
                httpPath: url.pathname,
                options: {
                    sessionIdGenerator: () => {
                        return (0, crypto_1.randomUUID)();
                    },
                    enableJsonResponse: true,
                },
                req,
                res,
            });
        });
    });
    app.use('/mcp/:id', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Expose-Headers', '*');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }
        req.auth = await organizationService.getOrgByApiKey(req.params.id);
        if (!req.auth) {
            res.status(400).send('Invalid API Key');
            return;
        }
        const url = new URL(`/mcp/${req.params.id}`, process.env.NEXT_PUBLIC_BACKEND_URL);
        fixAcceptHeader(req);
        await (0, async_storage_1.runWithContext)({ requestId: req.params.id, auth: req.auth }, async () => {
            await server.startHTTP({
                url,
                httpPath: url.pathname,
                options: {
                    sessionIdGenerator: () => {
                        return (0, crypto_1.randomUUID)();
                    },
                    enableJsonResponse: true,
                },
                req,
                res,
            });
        });
    });
    app.use(['/sse/:id', '/message/:id'], async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Expose-Headers', '*');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }
        req.auth = await organizationService.getOrgByApiKey(req.params.id);
        if (!req.auth) {
            res.status(400).send('Invalid API Key');
            return;
        }
        const url = new URL(req.originalUrl, process.env.NEXT_PUBLIC_BACKEND_URL);
        await (0, async_storage_1.runWithContext)({ requestId: req.params.id, auth: req.auth }, async () => {
            await new mcp_1.MCPServer(serverConfig).startSSE({
                url,
                ssePath: `/sse/${req.params.id}`,
                messagePath: `/message/${req.params.id}`,
                req,
                res,
            });
        });
    });
};
exports.startMcp = startMcp;
//# sourceMappingURL=start.mcp.js.map