export interface MCPServerOAuthConfig {
    resource: string;
    authorizationServers: string[];
    scopesSupported?: string[];
    resourceName?: string;
    resourceDocumentation?: string;
    validateToken?: (token: string, resource: string) => Promise<TokenValidationResult>;
}
export interface TokenValidationResult {
    valid: boolean;
    error?: string;
    errorDescription?: string;
    scopes?: string[];
    subject?: string;
    expiresAt?: number;
    claims?: Record<string, unknown>;
}
export interface OAuthResponseOptions {
    resourceMetadataUrl?: string;
    additionalParams?: Record<string, string>;
}
export interface OAuthProtectedResourceMetadata {
    resource: string;
    authorization_servers: string[];
    scopes_supported?: string[];
    bearer_methods_supported?: string[];
    resource_name?: string;
    resource_documentation?: string;
}
export declare function generateWWWAuthenticateHeader(options?: OAuthResponseOptions): string;
export declare function generateProtectedResourceMetadata(config: MCPServerOAuthConfig): OAuthProtectedResourceMetadata;
export declare function extractBearerToken(authHeader: string | null | undefined): string | undefined;
