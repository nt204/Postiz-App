export declare class NewsletterService {
    static getProvider(): import("./providers/beehiiv.provider").BeehiivProvider | import("./providers/email-empty.provider").EmailEmptyProvider | import("./providers/listmonk.provider").ListmonkProvider;
    static register(email: string): Promise<void>;
}
