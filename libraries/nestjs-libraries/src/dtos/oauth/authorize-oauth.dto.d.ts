export declare class AuthorizeOAuthQueryDto {
    client_id: string;
    response_type: string;
    state?: string;
}
export declare class ApproveOAuthDto {
    client_id: string;
    state?: string;
    action: 'approve' | 'deny';
}
