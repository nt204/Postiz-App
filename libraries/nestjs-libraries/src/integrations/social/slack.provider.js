"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const slack_dto_1 = require("../../dtos/posts/providers-settings/slack.dto");
const tool_decorator_1 = require("../tool.decorator");
class SlackProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 3;
        this.identifier = 'slack';
        this.name = 'Slack';
        this.isBetweenSteps = false;
        this.editor = 'normal';
        this.scopes = [
            'channels:read',
            'chat:write',
            'users:read',
            'groups:read',
            'channels:join',
            'chat:write.customize',
        ];
        this.dto = slack_dto_1.SlackDto;
    }
    maxLength() {
        return 400000;
    }
    async refreshToken(refreshToken) {
        return {
            refreshToken: '',
            expiresIn: 1000000,
            accessToken: '',
            id: '',
            name: '',
            picture: '',
            username: '',
        };
    }
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(6);
        return {
            url: `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_ID}&redirect_uri=${encodeURIComponent(`${process?.env?.FRONTEND_URL?.indexOf('https') === -1
                ? 'https://redirectmeto.com/'
                : ''}${process?.env?.FRONTEND_URL}/integrations/social/slack`)}&scope=channels:read,chat:write,users:read,groups:read,channels:join,chat:write.customize&state=${state}`,
            codeVerifier: (0, make_is_1.makeId)(10),
            state,
        };
    }
    async authenticate(params) {
        const { access_token, team, bot_user_id, scope } = await (await this.fetch(`https://slack.com/api/oauth.v2.access`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.SLACK_ID,
                client_secret: process.env.SLACK_SECRET,
                code: params.code,
                redirect_uri: `${process?.env?.FRONTEND_URL?.indexOf('https') === -1
                    ? 'https://redirectmeto.com/'
                    : ''}${process?.env?.FRONTEND_URL}/integrations/social/slack${params.refresh ? `?refresh=${params.refresh}` : ''}`,
            }),
        })).json();
        this.checkScopes(this.scopes, scope.split(','));
        const { user } = await (await fetch(`https://slack.com/api/users.info?user=${bot_user_id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })).json();
        return {
            id: team.id,
            name: user.real_name,
            accessToken: access_token,
            refreshToken: 'null',
            expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
            picture: user?.profile?.image_original || '',
            username: user.name,
        };
    }
    async channels(accessToken, params, id) {
        const list = await (await fetch(`https://slack.com/api/conversations.list?types=public_channel,private_channel`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return list.channels.map((p) => ({
            id: p.id,
            name: p.name,
        }));
    }
    async post(id, accessToken, postDetails, integration) {
        const [firstPost] = postDetails;
        const channel = firstPost.settings.channel;
        await fetch(`https://slack.com/api/conversations.join`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel,
            }),
        });
        const { ts, channel: responseChannel } = await (await fetch(`https://slack.com/api/chat.postMessage`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel,
                username: integration.name,
                icon_url: integration.picture,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: firstPost.message,
                        },
                    },
                    ...(firstPost.media?.length
                        ? firstPost.media.map((m) => ({
                            type: 'image',
                            image_url: m.path,
                            alt_text: '',
                        }))
                        : []),
                ],
            }),
        })).json();
        const { permalink } = await (await fetch(`https://slack.com/api/chat.getPermalink?channel=${responseChannel}&message_ts=${ts}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return [
            {
                id: firstPost.id,
                postId: ts,
                releaseURL: permalink || '',
                status: 'posted',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const channel = commentPost.settings.channel;
        const threadTs = lastCommentId || postId;
        const { ts, channel: responseChannel } = await (await fetch(`https://slack.com/api/chat.postMessage`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel,
                username: integration.name,
                icon_url: integration.picture,
                thread_ts: threadTs,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: commentPost.message,
                        },
                    },
                    ...(commentPost.media?.length
                        ? commentPost.media.map((m) => ({
                            type: 'image',
                            image_url: m.path,
                            alt_text: '',
                        }))
                        : []),
                ],
            }),
        })).json();
        const { permalink } = await (await fetch(`https://slack.com/api/chat.getPermalink?channel=${responseChannel}&message_ts=${ts}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return [
            {
                id: commentPost.id,
                postId: ts,
                releaseURL: permalink || '',
                status: 'posted',
            },
        ];
    }
    async changeProfilePicture(id, accessToken, url) {
        return {
            url,
        };
    }
    async changeNickname(id, accessToken, name) {
        return {
            name,
        };
    }
}
exports.SlackProvider = SlackProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Get list of channels',
        dataSchema: [],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], SlackProvider.prototype, "channels", null);
//# sourceMappingURL=slack.provider.js.map