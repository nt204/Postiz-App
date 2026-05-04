export declare function minifyPostsList(data: {
    posts: any[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}): Record<string, any>;
export declare function expandPostsList(data: any): Record<string, any>;
export declare function minifyPosts(data: {
    posts: any[];
}): Record<string, any>;
export declare function expandPosts(data: any): Record<string, any>;
