"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LemmyProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const auth_service_1 = require("../../../../helpers/src/auth/auth.service");
const lemmy_dto_1 = require("../../dtos/posts/providers-settings/lemmy.dto");
const tool_decorator_1 = require("../tool.decorator");
class LemmyProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 3;
        this.identifier = 'lemmy';
        this.name = 'Lemmy';
        this.isBetweenSteps = false;
        this.scopes = [];
        this.editor = 'normal';
        this.dto = lemmy_dto_1.LemmySettingsDto;
    }
    maxLength() {
        return 10000;
    }
    async customFields() {
        return [
            {
                key: 'service',
                label: 'Service',
                defaultValue: 'https://lemmy.world',
                validation: `/^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$/`,
                type: 'text',
            },
            {
                key: 'identifier',
                label: 'Identifier',
                validation: `/^.{3,}$/`,
                type: 'text',
            },
            {
                key: 'password',
                label: 'Password',
                validation: `/^.{3,}$/`,
                type: 'password',
            },
        ];
    }
    async refreshToken(refreshToken) {
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
        const state = (0, make_is_1.makeId)(6);
        return {
            url: state,
            codeVerifier: (0, make_is_1.makeId)(10),
            state,
        };
    }
    async authenticate(params) {
        const body = JSON.parse(Buffer.from(params.code, 'base64').toString());
        const load = await fetch(body.service + '/api/v3/user/login', {
            body: JSON.stringify({
                username_or_email: body.identifier,
                password: body.password,
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (load.status === 401) {
            return 'Invalid credentials';
        }
        const { jwt } = await load.json();
        try {
            const user = await (await fetch(body.service + `/api/v3/user?username=${body.identifier}`, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            })).json();
            return {
                refreshToken: jwt,
                expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
                accessToken: jwt,
                id: String(user.person_view.person.id),
                name: user.person_view.person.display_name ||
                    user.person_view.person.name ||
                    '',
                picture: user?.person_view?.person?.avatar || '',
                username: body.identifier || '',
            };
        }
        catch (e) {
            console.log(e);
            return 'Invalid credentials';
        }
    }
    async getJwtAndService(integration) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const { jwt } = await (await fetch(body.service + '/api/v3/user/login', {
            body: JSON.stringify({
                username_or_email: body.identifier,
                password: body.password,
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })).json();
        return { jwt, service: body.service };
    }
    async post(id, accessToken, postDetails, integration) {
        const [firstPost] = postDetails;
        const { jwt, service } = await this.getJwtAndService(integration);
        const valueArray = [];
        for (const lemmy of firstPost.settings.subreddit) {
            console.log({
                community_id: +lemmy.value.id,
                name: lemmy.value.title,
                body: firstPost.message,
                ...(lemmy.value.url ? { url: lemmy.value.url } : {}),
                ...(firstPost.media?.length
                    ? { custom_thumbnail: firstPost.media[0].path }
                    : {}),
                nsfw: false,
            });
            const { post_view } = await (await fetch(service + '/api/v3/post', {
                body: JSON.stringify({
                    community_id: +lemmy.value.id,
                    name: lemmy.value.title,
                    body: firstPost.message,
                    ...(lemmy.value.url
                        ? {
                            url: lemmy.value.url.indexOf('http') === -1
                                ? `https://${lemmy.value.url}`
                                : lemmy.value.url,
                        }
                        : {}),
                    ...(firstPost.media?.length
                        ? { custom_thumbnail: firstPost.media[0].path }
                        : {}),
                    nsfw: false,
                }),
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
            })).json();
            valueArray.push({
                postId: post_view.post.id,
                releaseURL: service + '/post/' + post_view.post.id,
                id: firstPost.id,
                status: 'published',
            });
        }
        return [
            {
                id: firstPost.id,
                postId: valueArray.map((p) => String(p.postId)).join(','),
                releaseURL: valueArray.map((p) => p.releaseURL).join(','),
                status: 'published',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const { jwt, service } = await this.getJwtAndService(integration);
        const postIds = postId.split(',');
        const valueArray = [];
        for (const singlePostId of postIds) {
            const { comment_view } = await (await fetch(service + '/api/v3/comment', {
                body: JSON.stringify({
                    post_id: +singlePostId,
                    content: commentPost.message,
                }),
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
            })).json();
            valueArray.push({
                postId: String(comment_view.comment.id),
                releaseURL: service + '/comment/' + comment_view.comment.id,
                id: commentPost.id,
                status: 'published',
            });
        }
        return [
            {
                id: commentPost.id,
                postId: valueArray.map((p) => p.postId).join(','),
                releaseURL: valueArray.map((p) => p.releaseURL).join(','),
                status: 'published',
            },
        ];
    }
    async subreddits(accessToken, data, id, integration) {
        const { jwt, service } = await this.getJwtAndService(integration);
        const { communities } = await (await fetch(service + `/api/v3/search?type_=Communities&sort=Active&q=${data.word}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        })).json();
        return communities.map((p) => ({
            title: p.community.title,
            name: p.community.title,
            id: p.community.id,
        }));
    }
}
exports.LemmyProvider = LemmyProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Search for Lemmy communities by keyword',
        dataSchema: [
            {
                key: 'word',
                type: 'string',
                description: 'Keyword to search for',
            },
        ],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LemmyProvider.prototype, "subreddits", null);
//# sourceMappingURL=lemmy.provider.js.map