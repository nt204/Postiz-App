"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterService = void 0;
const providers_1 = require("./providers");
class NewsletterService {
    static getProvider() {
        if (process.env.BEEHIIVE_API_KEY) {
            return providers_1.newsletterProviders.find((p) => p.name === 'beehiiv');
        }
        if (process.env.LISTMONK_API_KEY) {
            return providers_1.newsletterProviders.find((p) => p.name === 'listmonk');
        }
        return providers_1.newsletterProviders.find((p) => p.name === 'empty');
    }
    static async register(email) {
        if (email.indexOf('@') === -1) {
            return;
        }
        return NewsletterService.getProvider().register(email);
    }
}
exports.NewsletterService = NewsletterService;
//# sourceMappingURL=newsletter.service.js.map