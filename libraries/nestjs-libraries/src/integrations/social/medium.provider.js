"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediumProvider = void 0;
const tslib_1 = require("tslib");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const make_is_1 = require("../../services/make.is");
const medium_settings_dto_1 = require("../../dtos/posts/providers-settings/medium.settings.dto");
const tool_decorator_1 = require("../tool.decorator");
class MediumProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 3;
        this.identifier = 'medium';
        this.name = 'Medium';
        this.isBetweenSteps = false;
        this.scopes = [];
        this.editor = 'markdown';
        this.dto = medium_settings_dto_1.MediumSettingsDto;
    }
    maxLength() {
        return 100000;
    }
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(6);
        return {
            url: state,
            codeVerifier: (0, make_is_1.makeId)(10),
            state,
        };
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
    async customFields() {
        return [
            {
                key: 'apiKey',
                label: 'API key',
                validation: `/^.{3,}$/`,
                type: 'password',
            },
        ];
    }
    async authenticate(params) {
        const body = JSON.parse(Buffer.from(params.code, 'base64').toString());
        try {
            const { data: { name, id, imageUrl, username }, } = await (await fetch('https://api.medium.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${body.apiKey}`,
                },
            })).json();
            return {
                refreshToken: '',
                expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
                accessToken: body.apiKey,
                id,
                name,
                picture: imageUrl || '',
                username,
            };
        }
        catch (err) {
            return 'Invalid credentials';
        }
    }
    async publications(accessToken, _, id) {
        const { data } = await (await fetch(`https://api.medium.com/v1/users/${id}/publications`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return data;
    }
    async post(id, accessToken, postDetails, integration) {
        const { settings } = postDetails?.[0] || { settings: {} };
        const { data } = await (await fetch(settings?.publication
            ? `https://api.medium.com/v1/publications/${settings?.publication}/posts`
            : `https://api.medium.com/v1/users/${id}/posts`, {
            method: 'POST',
            body: JSON.stringify({
                title: settings.title,
                contentFormat: 'markdown',
                content: postDetails?.[0].message,
                ...(settings.canonical ? { canonicalUrl: settings.canonical } : {}),
                ...(settings?.tags?.length
                    ? { tags: settings?.tags?.map((p) => p.value) }
                    : {}),
                publishStatus: settings?.publication ? 'draft' : 'public',
            }),
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })).json();
        return [
            {
                id: postDetails?.[0].id,
                status: 'completed',
                postId: data.id,
                releaseURL: data.url,
            },
        ];
    }
}
exports.MediumProvider = MediumProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'List of publications', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], MediumProvider.prototype, "publications", null);
//# sourceMappingURL=medium.provider.js.map