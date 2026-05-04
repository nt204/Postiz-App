"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeehiivProvider = void 0;
class BeehiivProvider {
    constructor() {
        this.name = 'beehiiv';
    }
    async register(email) {
        const body = {
            email,
            reactivate_existing: false,
            send_welcome_email: true,
            utm_source: 'gitroom_platform',
        };
        await fetch(`https://api.beehiiv.com/v2/publications/${process.env.BEEHIIVE_PUBLICATION_ID}/subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${process.env.BEEHIIVE_API_KEY}`,
            },
            body: JSON.stringify(body),
        });
    }
}
exports.BeehiivProvider = BeehiivProvider;
//# sourceMappingURL=beehiiv.provider.js.map