"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordpressProvider = void 0;
const tslib_1 = require("tslib");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const make_is_1 = require("../../services/make.is");
const wordpress_dto_1 = require("../../dtos/posts/providers-settings/wordpress.dto");
const slugify_1 = tslib_1.__importDefault(require("slugify"));
const tool_decorator_1 = require("../tool.decorator");
class WordpressProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'wordpress';
        this.name = 'WordPress';
        this.isBetweenSteps = false;
        this.editor = 'html';
        this.scopes = [];
        this.maxConcurrentJob = 5;
        this.dto = wordpress_dto_1.WordpressDto;
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
    handleErrors(body) {
        if (body.indexOf('rest_cannot_create') > -1) {
            return {
                type: 'bad-body',
                value: 'The connect user has insufficient permissions to create posts',
            };
        }
        return undefined;
    }
    async customFields() {
        return [
            {
                key: 'domain',
                label: 'Domain URL',
                validation: `/^https?:\\/\\/(?:www\\.)?[\\w\\-]+(\\.[\\w\\-]+)+([\\/?#][^\\s]*)?$/`,
                type: 'text',
            },
            {
                key: 'username',
                label: 'Username',
                validation: `/.+/`,
                type: 'text',
            },
            {
                key: 'password',
                label: 'Password',
                validation: `/.+/`,
                type: 'password',
            },
        ];
    }
    async authenticate(params) {
        const body = JSON.parse(Buffer.from(params.code, 'base64').toString());
        try {
            const auth = Buffer.from(`${body.username}:${body.password}`).toString('base64');
            const { id, name, avatar_urls, code } = await (await fetch(`${body.domain}/wp-json/wp/v2/users/me`, {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            })).json();
            if (code) {
                throw "Invalid credentials";
            }
            const biggestImage = Object.entries(avatar_urls || {}).reduce((all, current) => {
                if (all > Number(current[0])) {
                    return all;
                }
                return Number(current[0]);
            }, 0);
            return {
                refreshToken: '',
                expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
                accessToken: params.code,
                id: body.domain + '_' + id,
                name,
                picture: avatar_urls?.[String(biggestImage)] || '',
                username: body.username,
            };
        }
        catch (err) {
            console.log(err);
            return 'Invalid credentials';
        }
    }
    async postTypes(token) {
        const body = JSON.parse(Buffer.from(token, 'base64').toString());
        const auth = Buffer.from(`${body.username}:${body.password}`).toString('base64');
        const postTypes = await (await this.fetch(`${body.domain}/wp-json/wp/v2/types`, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        })).json();
        return Object.entries(postTypes).reduce((all, [key, value]) => {
            if (key.indexOf('wp_') > -1 ||
                key.indexOf('nav_') > -1 ||
                key === 'attachment') {
                return all;
            }
            all.push({
                id: value.rest_base,
                name: value.name,
            });
            return all;
        }, []);
    }
    async post(id, accessToken, postDetails, integration) {
        const body = JSON.parse(Buffer.from(accessToken, 'base64').toString());
        const auth = Buffer.from(`${body.username}:${body.password}`).toString('base64');
        let mediaId = '';
        if (postDetails?.[0]?.settings?.main_image?.path) {
            console.log('Uploading image to WordPress', postDetails[0].settings.main_image.path);
            const blob = await this.fetch(postDetails[0].settings.main_image.path).then((r) => r.blob());
            const mediaResponse = await (await this.fetch(`${body.domain}/wp-json/wp/v2/media`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Disposition': `attachment; filename="${postDetails[0].settings.main_image.path
                        .split('/')
                        .pop()}"`,
                    'Content-Type': blob.type,
                },
                body: blob,
            })).json();
            mediaId = mediaResponse.id;
        }
        const submit = await (await this.fetch(`${body.domain}/wp-json/wp/v2/${postDetails?.[0]?.settings?.type}`, {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                title: postDetails?.[0]?.settings?.title,
                content: postDetails?.[0]?.message,
                slug: (0, slugify_1.default)(postDetails?.[0]?.settings?.title, {
                    lower: true,
                    strict: true,
                    trim: true,
                }),
                status: 'publish',
                ...(mediaId ? { featured_media: mediaId } : {}),
            }),
        })).json();
        return [
            {
                id: postDetails?.[0].id,
                status: 'completed',
                postId: String(submit.id),
                releaseURL: submit.link,
            },
        ];
    }
}
exports.WordpressProvider = WordpressProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Get list of post types',
        dataSchema: [],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], WordpressProvider.prototype, "postTypes", null);
//# sourceMappingURL=wordpress.provider.js.map