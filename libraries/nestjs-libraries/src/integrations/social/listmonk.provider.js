"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListmonkProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const listmonk_dto_1 = require("../../dtos/posts/providers-settings/listmonk.dto");
const auth_service_1 = require("../../../../helpers/src/auth/auth.service");
const slugify_1 = tslib_1.__importDefault(require("slugify"));
const tool_decorator_1 = require("../tool.decorator");
class ListmonkProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 100;
        this.identifier = 'listmonk';
        this.name = 'ListMonk';
        this.isBetweenSteps = false;
        this.scopes = [];
        this.editor = 'html';
        this.dto = listmonk_dto_1.ListmonkDto;
    }
    maxLength() {
        return 100000000;
    }
    async customFields() {
        return [
            {
                key: 'url',
                label: 'URL',
                defaultValue: '',
                validation: `/^(https?:\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?:localhost)|(?:\\d{1,3}(?:\\.\\d{1,3}){3})|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,63})(?::\\d{2,5})?(?:\\/[^\\s?#]*)?(?:\\?[^\\s#]*)?(?:#[^\\s]*)?$/`,
                type: 'text',
            },
            {
                key: 'username',
                label: 'Username',
                validation: `/^.+$/`,
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
        console.log(body);
        try {
            const basic = Buffer.from(body.username + ':' + body.password).toString('base64');
            const { data } = await (await this.fetch(body.url + '/api/settings', {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: 'Basic ' + basic,
                },
            })).json();
            return {
                refreshToken: basic,
                expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
                accessToken: basic,
                id: Buffer.from(body.url).toString('base64'),
                name: data['app.site_name'],
                picture: data['app.logo_url'] || '',
                username: data['app.site_name'],
            };
        }
        catch (e) {
            console.log(e);
            return 'Invalid credentials';
        }
    }
    async list(token, data, internalId, integration) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const auth = Buffer.from(`${body.username}:${body.password}`).toString('base64');
        const postTypes = await (await this.fetch(`${body.url}/api/lists`, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        })).json();
        return postTypes.data.results.map((p) => ({ id: p.id, name: p.name }));
    }
    async templates(token, data, internalId, integration) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const auth = Buffer.from(`${body.username}:${body.password}`).toString('base64');
        const postTypes = await (await this.fetch(`${body.url}/api/templates`, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        })).json();
        return [
            { id: 0, name: 'Default' },
            ...postTypes.data.map((p) => ({ id: p.id, name: p.name })),
        ];
    }
    async post(id, accessToken, postDetails, integration) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const auth = Buffer.from(`${body.username}:${body.password}`).toString('base64');
        const sendBody = `
<style>
.content {
  padding: 20px;
  font-size: 15px;
  line-height: 1.6;
}
</style>
<div class="hidden-preheader"
       style="display:none !important; visibility:hidden; opacity:0; overflow:hidden;
              max-height:0; max-width:0; line-height:1px; font-size:1px; color:transparent;
              mso-hide:all;">
    <!-- A short visible decoy (optional): shows as "." or short text in preview -->
    ${postDetails?.[0]?.settings?.preview || ''}
    <!-- Then invisible padding to eat up preview characters -->
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    <!-- Repeat the trio (zero-width space, zero-width non-joiner, nbsp, BOM) a bunch of times -->
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
    &#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;&#8203;&zwnj;&nbsp;&#65279;
  </div>
  
  <div class="content">
    ${postDetails[0].message}
  </div>
`;
        const { data: { uuid: postId, id: campaignId }, } = await (await this.fetch(body.url + '/api/campaigns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
                name: (0, slugify_1.default)(postDetails[0].settings.subject, {
                    lower: true,
                    strict: true,
                    trim: true,
                }),
                type: 'regular',
                content_type: 'html',
                subject: postDetails[0].settings.subject,
                lists: [+postDetails[0].settings.list],
                body: sendBody,
                ...(+postDetails?.[0]?.settings?.template
                    ? { template_id: +postDetails[0].settings.template }
                    : {}),
            }),
        })).json();
        await this.fetch(body.url + `/api/campaigns/${campaignId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
                status: 'running',
            }),
        });
        return [
            {
                id: postDetails[0].id,
                status: 'completed',
                releaseURL: `${body.url}/api/campaigns/${campaignId}/preview`,
                postId,
            },
        ];
    }
}
exports.ListmonkProvider = ListmonkProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'List of available lists', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ListmonkProvider.prototype, "list", null);
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'List of available templates', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ListmonkProvider.prototype, "templates", null);
//# sourceMappingURL=listmonk.provider.js.map