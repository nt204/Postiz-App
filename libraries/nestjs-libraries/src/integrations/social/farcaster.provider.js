"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarcasterProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const social_abstract_1 = require("../social.abstract");
const nodejs_sdk_1 = require("@neynar/nodejs-sdk");
const farcaster_dto_1 = require("../../dtos/posts/providers-settings/farcaster.dto");
const tool_decorator_1 = require("../tool.decorator");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
const client = new nodejs_sdk_1.NeynarAPIClient({
    apiKey: process.env.NEYNAR_SECRET_KEY || '00000000-000-0000-000-000000000000',
});
let FarcasterProvider = class FarcasterProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'wrapcast';
        this.name = 'Farcaster';
        this.isBetweenSteps = false;
        this.isWeb3 = true;
        this.scopes = [];
        this.maxConcurrentJob = 3;
        this.editor = 'normal';
        this.dto = farcaster_dto_1.FarcasterDto;
    }
    maxLength() {
        return 800;
    }
    async refreshToken(refresh_token) {
        return {
            refreshToken: '',
            expiresIn: 0,
            accessToken: '',
            id: '',
            name: '',
            picture: '',
            username: '',
        };
    }
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(17);
        return {
            url: `${process.env.NEYNAR_CLIENT_ID}||${state}` || '',
            codeVerifier: (0, make_is_1.makeId)(10),
            state,
        };
    }
    async authenticate(params) {
        const data = JSON.parse(Buffer.from(params.code, 'base64').toString());
        return {
            id: String(data.fid),
            name: data.display_name,
            accessToken: data.signer_uuid,
            refreshToken: '',
            expiresIn: (0, dayjs_1.default)().add(200, 'year').unix() - (0, dayjs_1.default)().unix(),
            picture: data?.pfp_url || '',
            username: data.username,
        };
    }
    async post(id, accessToken, postDetails) {
        const [firstPost] = postDetails;
        const ids = [];
        const channels = !firstPost?.settings?.subreddit ||
            firstPost?.settings?.subreddit.length === 0
            ? [undefined]
            : firstPost?.settings?.subreddit;
        for (const channel of channels) {
            const data = await client.publishCast({
                embeds: firstPost?.media?.map((media) => ({
                    url: media.path,
                })) || [],
                signerUuid: accessToken,
                text: firstPost.message,
                ...(channel?.value?.id ? { channelId: channel?.value?.id } : {}),
            });
            ids.push({
                releaseURL: `https://warpcast.com/${data.cast.author.username}/${data.cast.hash}`,
                postId: data.cast.hash,
            });
        }
        return [
            {
                id: firstPost.id,
                postId: ids.map((p) => p.postId).join(','),
                releaseURL: ids.map((p) => p.releaseURL).join(','),
                status: 'published',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const ids = [];
        const parentIds = (lastCommentId || postId).split(',');
        for (const parentHash of parentIds) {
            const data = await client.publishCast({
                embeds: commentPost?.media?.map((media) => ({
                    url: media.path,
                })) || [],
                signerUuid: accessToken,
                text: commentPost.message,
                parent: parentHash,
            });
            ids.push({
                releaseURL: `https://warpcast.com/${data.cast.author.username}/${data.cast.hash}`,
                postId: data.cast.hash,
            });
        }
        return [
            {
                id: commentPost.id,
                postId: ids.map((p) => p.postId).join(','),
                releaseURL: ids.map((p) => p.releaseURL).join(','),
                status: 'published',
            },
        ];
    }
    async subreddits(accessToken, data, id, integration) {
        const search = await client.searchChannels({
            q: data.word,
            limit: 10,
        });
        return search.channels.map((p) => {
            return {
                title: p.name,
                name: p.name,
                id: p.id,
            };
        });
    }
};
exports.FarcasterProvider = FarcasterProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Search channels',
        dataSchema: [{ key: 'word', type: 'string', description: 'Search word' }],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FarcasterProvider.prototype, "subreddits", null);
exports.FarcasterProvider = FarcasterProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)('Farcaster/Warpcast can only accept pictures')
], FarcasterProvider);
//# sourceMappingURL=farcaster.provider.js.map