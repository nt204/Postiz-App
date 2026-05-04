"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevToProvider = void 0;
const tslib_1 = require("tslib");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const make_is_1 = require("../../services/make.is");
const dev_to_settings_dto_1 = require("../../dtos/posts/providers-settings/dev.to.settings.dto");
const tool_decorator_1 = require("../tool.decorator");
class DevToProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 3;
        this.identifier = 'devto';
        this.name = 'Dev.to';
        this.isBetweenSteps = false;
        this.editor = 'markdown';
        this.scopes = [];
        this.dto = dev_to_settings_dto_1.DevToSettingsDto;
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
    handleErrors(body) {
        if (body.indexOf('Canonical url has already been taken') > -1) {
            return {
                type: 'bad-body',
                value: 'Canonical URL already exists',
            };
        }
        return undefined;
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
            const { name, id, profile_image, username } = await (await fetch('https://dev.to/api/users/me', {
                headers: {
                    'api-key': body.apiKey,
                },
            })).json();
            return {
                refreshToken: '',
                expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
                accessToken: body.apiKey,
                id,
                name,
                picture: profile_image || '',
                username,
            };
        }
        catch (err) {
            return 'Invalid credentials';
        }
    }
    async tags(token) {
        const tags = await (await fetch('https://dev.to/api/tags?per_page=1000&page=1', {
            headers: {
                'api-key': token,
            },
        })).json();
        return tags.map((p) => ({ value: p.id, label: p.name }));
    }
    async organizations(token) {
        const orgs = await (await fetch('https://dev.to/api/articles/me/all?per_page=1000', {
            headers: {
                'api-key': token,
            },
        })).json();
        const allOrgs = [
            ...new Set(orgs
                .flatMap((org) => org?.organization?.username)
                .filter((f) => f)),
        ];
        const fullDetails = await Promise.all(allOrgs.map(async (org) => {
            return (await fetch(`https://dev.to/api/organizations/${org}`, {
                headers: {
                    'api-key': token,
                },
            })).json();
        }));
        return fullDetails.map((org) => ({
            id: org.id,
            name: org.name,
            username: org.username,
        }));
    }
    async post(id, accessToken, postDetails, integration) {
        const { settings } = postDetails?.[0] || { settings: {} };
        const { id: postId, url } = await (await this.fetch(`https://dev.to/api/articles`, {
            method: 'POST',
            body: JSON.stringify({
                article: {
                    title: settings.title,
                    body_markdown: postDetails?.[0].message,
                    published: true,
                    ...(settings?.main_image?.path
                        ? { main_image: settings?.main_image?.path }
                        : {}),
                    tags: settings?.tags?.map((t) => t.label),
                    organization_id: settings.organization,
                    ...(settings.canonical
                        ? { canonical_url: settings.canonical }
                        : {}),
                },
            }),
            headers: {
                'Content-Type': 'application/json',
                'api-key': accessToken,
            },
        })).json();
        return [
            {
                id: postDetails?.[0].id,
                status: 'completed',
                postId: String(postId),
                releaseURL: url,
            },
        ];
    }
}
exports.DevToProvider = DevToProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'Tag list', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], DevToProvider.prototype, "tags", null);
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'Organization list', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], DevToProvider.prototype, "organizations", null);
//# sourceMappingURL=dev.to.provider.js.map