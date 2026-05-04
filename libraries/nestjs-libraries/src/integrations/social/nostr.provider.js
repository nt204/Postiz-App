"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NostrProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const social_abstract_1 = require("../social.abstract");
const nostr_tools_1 = require("nostr-tools");
const ws_1 = tslib_1.__importDefault(require("ws"));
const auth_service_1 = require("../../../../helpers/src/auth/auth.service");
global.WebSocket = ws_1.default;
const list = [
    'wss://nos.lol',
    'wss://relay.damus.io',
    'wss://relay.snort.social',
    'wss://temp.iris.to',
    'wss://vault.iris.to',
];
const pool = new nostr_tools_1.SimplePool();
class NostrProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 5;
        this.identifier = 'nostr';
        this.name = 'Nostr';
        this.isBetweenSteps = false;
        this.scopes = [];
        this.editor = 'normal';
        this.toolTip = 'Make sure you private a HEX key of your Nostr private key, you can get it from websites like iris.to';
    }
    maxLength() {
        return 100000;
    }
    async customFields() {
        return [
            {
                key: 'password',
                label: 'Nostr private key',
                validation: `/^.{3,}$/`,
                type: 'password',
            },
        ];
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
            url: state,
            codeVerifier: (0, make_is_1.makeId)(10),
            state,
        };
    }
    async findRelayInformation(pubkey) {
        const evt = await pool.get(list, {
            kinds: [0],
            authors: [pubkey],
            limit: 1,
        });
        if (!evt)
            return {};
        let content = {};
        try {
            content = JSON.parse(evt.content || '{}');
        }
        catch {
            return {};
        }
        if (content.name || content.displayName || content.display_name) {
            return content;
        }
        return {};
    }
    async publish(pubkey, event) {
        let id = '';
        for (const relay of list) {
            try {
                const relayInstance = await nostr_tools_1.Relay.connect(relay);
                const value = new Promise((resolve) => {
                    relayInstance.subscribe([{ kinds: [1], authors: [pubkey] }], {
                        eoseTimeout: 6000,
                        onevent: (event) => {
                            resolve(event);
                        },
                        oneose: () => {
                            resolve({});
                        },
                        onclose: () => {
                            resolve({});
                        },
                    });
                });
                await relayInstance.publish(event);
                const all = await value;
                relayInstance.close();
                id = id || all?.id;
            }
            catch (err) {
            }
        }
        return id;
    }
    async authenticate(params) {
        try {
            const body = JSON.parse(Buffer.from(params.code, 'base64').toString());
            const pubkey = (0, nostr_tools_1.getPublicKey)(Uint8Array.from(body.password.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))));
            const user = await this.findRelayInformation(pubkey);
            return {
                id: pubkey,
                name: user.display_name || user.displayName || user.name || 'No Name',
                accessToken: auth_service_1.AuthService.signJWT({ password: body.password }),
                refreshToken: '',
                expiresIn: (0, dayjs_1.default)().add(200, 'year').unix() - (0, dayjs_1.default)().unix(),
                picture: user?.picture || '',
                username: user.name || 'nousername',
            };
        }
        catch (e) {
            console.log(e);
            return 'Invalid credentials';
        }
    }
    buildContent(post) {
        const mediaContent = post.media?.map((m) => m.path).join('\n\n') || '';
        return mediaContent
            ? `${post.message}\n\n${mediaContent}`
            : post.message;
    }
    async post(id, accessToken, postDetails) {
        const { password } = auth_service_1.AuthService.verifyJWT(accessToken);
        const [firstPost] = postDetails;
        const textEvent = (0, nostr_tools_1.finalizeEvent)({
            kind: 1,
            content: this.buildContent(firstPost),
            tags: [],
            created_at: Math.floor(Date.now() / 1000),
        }, password);
        const eventId = await this.publish(id, textEvent);
        return [
            {
                id: firstPost.id,
                postId: String(eventId),
                releaseURL: `https://primal.net/e/${eventId}`,
                status: 'completed',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const { password } = auth_service_1.AuthService.verifyJWT(accessToken);
        const [commentPost] = postDetails;
        const replyToId = lastCommentId || postId;
        const textEvent = (0, nostr_tools_1.finalizeEvent)({
            kind: 1,
            content: this.buildContent(commentPost),
            tags: [
                ['e', replyToId, '', 'reply'],
                ['p', id],
            ],
            created_at: Math.floor(Date.now() / 1000),
        }, password);
        const eventId = await this.publish(id, textEvent);
        return [
            {
                id: commentPost.id,
                postId: String(eventId),
                releaseURL: `https://primal.net/e/${eventId}`,
                status: 'completed',
            },
        ];
    }
}
exports.NostrProvider = NostrProvider;
//# sourceMappingURL=nostr.provider.js.map