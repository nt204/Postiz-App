"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationManager = exports.socialIntegrationList = void 0;
const tslib_1 = require("tslib");
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const x_provider_1 = require("./social/x.provider");
const linkedin_provider_1 = require("./social/linkedin.provider");
const reddit_provider_1 = require("./social/reddit.provider");
const dev_to_provider_1 = require("./social/dev.to.provider");
const hashnode_provider_1 = require("./social/hashnode.provider");
const medium_provider_1 = require("./social/medium.provider");
const facebook_provider_1 = require("./social/facebook.provider");
const instagram_provider_1 = require("./social/instagram.provider");
const youtube_provider_1 = require("./social/youtube.provider");
const tiktok_provider_1 = require("./social/tiktok.provider");
const pinterest_provider_1 = require("./social/pinterest.provider");
const dribbble_provider_1 = require("./social/dribbble.provider");
const linkedin_page_provider_1 = require("./social/linkedin.page.provider");
const threads_provider_1 = require("./social/threads.provider");
const discord_provider_1 = require("./social/discord.provider");
const slack_provider_1 = require("./social/slack.provider");
const mastodon_provider_1 = require("./social/mastodon.provider");
const bluesky_provider_1 = require("./social/bluesky.provider");
const lemmy_provider_1 = require("./social/lemmy.provider");
const instagram_standalone_provider_1 = require("./social/instagram.standalone.provider");
const farcaster_provider_1 = require("./social/farcaster.provider");
const telegram_provider_1 = require("./social/telegram.provider");
const nostr_provider_1 = require("./social/nostr.provider");
const vk_provider_1 = require("./social/vk.provider");
const wordpress_provider_1 = require("./social/wordpress.provider");
const listmonk_provider_1 = require("./social/listmonk.provider");
const gmb_provider_1 = require("./social/gmb.provider");
const kick_provider_1 = require("./social/kick.provider");
const twitch_provider_1 = require("./social/twitch.provider");
const moltbook_provider_1 = require("./social/moltbook.provider");
const skool_provider_1 = require("./social/skool.provider");
const whop_provider_1 = require("./social/whop.provider");
const mewe_provider_1 = require("./social/mewe.provider");
exports.socialIntegrationList = [
    new x_provider_1.XProvider(),
    new linkedin_provider_1.LinkedinProvider(),
    new linkedin_page_provider_1.LinkedinPageProvider(),
    new reddit_provider_1.RedditProvider(),
    new instagram_provider_1.InstagramProvider(),
    new instagram_standalone_provider_1.InstagramStandaloneProvider(),
    new facebook_provider_1.FacebookProvider(),
    new threads_provider_1.ThreadsProvider(),
    new youtube_provider_1.YoutubeProvider(),
    new gmb_provider_1.GmbProvider(),
    new tiktok_provider_1.TiktokProvider(),
    new pinterest_provider_1.PinterestProvider(),
    new dribbble_provider_1.DribbbleProvider(),
    new discord_provider_1.DiscordProvider(),
    new slack_provider_1.SlackProvider(),
    new kick_provider_1.KickProvider(),
    new twitch_provider_1.TwitchProvider(),
    new mastodon_provider_1.MastodonProvider(),
    new bluesky_provider_1.BlueskyProvider(),
    new lemmy_provider_1.LemmyProvider(),
    new farcaster_provider_1.FarcasterProvider(),
    new telegram_provider_1.TelegramProvider(),
    new nostr_provider_1.NostrProvider(),
    new vk_provider_1.VkProvider(),
    new medium_provider_1.MediumProvider(),
    new dev_to_provider_1.DevToProvider(),
    new hashnode_provider_1.HashnodeProvider(),
    new wordpress_provider_1.WordpressProvider(),
    new listmonk_provider_1.ListmonkProvider(),
    new moltbook_provider_1.MoltbookProvider(),
    new whop_provider_1.WhopProvider(),
    new skool_provider_1.SkoolProvider(),
    new mewe_provider_1.MeweProvider(),
];
let IntegrationManager = class IntegrationManager {
    async getAllIntegrations() {
        return {
            social: await Promise.all(exports.socialIntegrationList.map(async (p) => ({
                name: p.name,
                identifier: p.identifier,
                toolTip: p.toolTip,
                editor: p.editor,
                isExternal: !!p.externalUrl,
                isWeb3: !!p.isWeb3,
                isChromeExtension: !!p.isChromeExtension,
                ...(p.extensionCookies ? { extensionCookies: p.extensionCookies } : {}),
                ...(p.customFields ? { customFields: await p.customFields() } : {}),
            }))),
            article: [],
        };
    }
    getAllTools() {
        return exports.socialIntegrationList.reduce((all, current) => ({
            ...all,
            [current.identifier]: Reflect.getMetadata('custom:tool', current.constructor.prototype) ||
                [],
        }), {});
    }
    getAllRulesDescription() {
        return exports.socialIntegrationList.reduce((all, current) => ({
            ...all,
            [current.identifier]: Reflect.getMetadata('custom:rules:description', current.constructor) || '',
        }), {});
    }
    getAllPlugs() {
        return exports.socialIntegrationList
            .map((p) => {
            return {
                name: p.name,
                identifier: p.identifier,
                plugs: (Reflect.getMetadata('custom:plug', p.constructor.prototype) || [])
                    .filter((f) => !f.disabled)
                    .map((p) => ({
                    ...p,
                    fields: p.fields.map((c) => ({
                        ...c,
                        validation: c?.validation?.toString(),
                    })),
                })),
            };
        })
            .filter((f) => f.plugs.length);
    }
    getInternalPlugs(providerName) {
        const p = exports.socialIntegrationList.find((p) => p.identifier === providerName);
        return {
            internalPlugs: (Reflect.getMetadata('custom:internal_plug', p.constructor.prototype) || []).filter((f) => !f.disabled) || [],
        };
    }
    getAllowedSocialsIntegrations() {
        return exports.socialIntegrationList.map((p) => p.identifier);
    }
    getSocialIntegration(integration) {
        return exports.socialIntegrationList.find((i) => i.identifier === integration);
    }
};
exports.IntegrationManager = IntegrationManager;
exports.IntegrationManager = IntegrationManager = tslib_1.__decorate([
    (0, common_1.Injectable)()
], IntegrationManager);
//# sourceMappingURL=integration.manager.js.map