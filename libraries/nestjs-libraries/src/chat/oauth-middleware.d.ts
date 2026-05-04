import type * as http from 'node:http';
import type { MCPServerOAuthConfig, TokenValidationResult } from './oauth-types';
interface OAuthMiddlewareLogger {
    debug?: (message: string, ...args: unknown[]) => void;
}
export interface OAuthMiddlewareOptions {
    oauth: MCPServerOAuthConfig;
    mcpPath?: string;
    logger?: OAuthMiddlewareLogger;
}
export interface OAuthMiddlewareResult {
    proceed: boolean;
    handled: boolean;
    tokenValidation?: TokenValidationResult;
}
export declare function createOAuthMiddleware(options: OAuthMiddlewareOptions): (req: http.IncomingMessage, res: http.ServerResponse, url: URL) => Promise<OAuthMiddlewareResult>;
export declare function createStaticTokenValidator(validTokens: string[]): MCPServerOAuthConfig['validateToken'];
export declare function createIntrospectionValidator(introspectionEndpoint: string, clientCredentials?: {
    clientId: string;
    clientSecret: string;
}): MCPServerOAuthConfig['validateToken'];
export {};
