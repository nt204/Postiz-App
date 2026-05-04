"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkoolProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const tool_decorator_1 = require("../tool.decorator");
const skool_dto_1 = require("../../dtos/posts/providers-settings/skool.dto");
const auth_service_1 = require("../../../../helpers/src/auth/auth.service");
class SkoolProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'skool';
        this.name = 'Skool';
        this.isBetweenSteps = false;
        this.isChromeExtension = true;
        this.scopes = [];
        this.editor = 'normal';
        this.dto = skool_dto_1.SkoolDto;
        this.extensionCookies = [
            { name: 'client_id', domain: '.skool.com' },
            { name: 'auth_token', domain: '.skool.com' },
        ];
    }
    getCookies(integration) {
        return auth_service_1.AuthService.verifyJWT(integration.customInstanceDetails);
    }
    handleErrors(body) {
        if (body.includes('must be admin or level')) {
            return { type: 'bad-body', value: 'You can\'t post to this channel' };
        }
        if (body.includes('cannot post to this label')) {
            return { type: 'bad-body', value: 'Cannot post to this label' };
        }
        return undefined;
    }
    maxLength() {
        return 5000;
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
        try {
            const cookies = JSON.parse(Buffer.from(params.code, 'base64').toString());
            const missing = this.extensionCookies
                .map((c) => c.name)
                .filter((name) => !cookies[name]);
            if (missing.length > 0) {
                return `Missing required cookies: ${missing.join(', ')}`;
            }
            const data = await (await fetch('https://api2.skool.com/self', {
                method: 'GET',
                headers: {
                    Cookie: `auth_token=${cookies.auth_token}; client_id=${cookies.client_id}`,
                },
            })).json();
            return {
                refreshToken: '',
                expiresIn: (0, dayjs_1.default)().add(100, 'year').unix() - (0, dayjs_1.default)().unix(),
                accessToken: auth_service_1.AuthService.signJWT(cookies),
                id: data.id,
                name: data.first_name + ' ' + data.last_name,
                picture: data.metadata.picture_profile || '',
                username: data.name,
            };
        }
        catch (e) {
            return 'Invalid cookie data';
        }
    }
    async groups(accessToken, params, id, integration) {
        try {
            const { client_id, auth_token } = this.getCookies(integration);
            const { groups } = await (await fetch(`https://api2.skool.com/users/${id}/groups?offset=0&limit=30`, {
                headers: {
                    Cookie: `auth_token=${auth_token}; client_id=${client_id}`,
                },
            })).json();
            return groups.map((p) => ({
                id: String(p.id),
                name: p.metadata.display_name,
            }));
        }
        catch (err) {
            return [];
        }
    }
    async label(accessToken, params, id, integration) {
        try {
            const { client_id, auth_token } = this.getCookies(integration);
            const { metadata } = await (await this.fetch(`https://api2.skool.com/groups/${params.id}`, {
                headers: {
                    Cookie: `auth_token=${auth_token}; client_id=${client_id}`,
                },
            })).json();
            if (!metadata.labels || metadata.labels.length === 0) {
                return [{ id: 'none', name: 'Default Label' }];
            }
            const labels = metadata.labels.split(',');
            if (labels.length === 0) {
                return [{ id: 'none', name: 'Default Label' }];
            }
            const labelInformation = await Promise.all(labels.map(async (labelId) => {
                return (await this.fetch(`https://api2.skool.com/labels/${labelId}`, {
                    headers: {
                        Cookie: `auth_token=${auth_token}; client_id=${client_id}`,
                    },
                })).json();
            }));
            return labelInformation.map((p) => ({
                id: String(p.id),
                name: p.metadata.display_name,
            }));
        }
        catch (err) {
            return [];
        }
    }
    async uploadMediaToSkool(media, userId, cookies) {
        if (!media || media.length === 0)
            return '';
        const fileIds = [];
        for (const item of media) {
            const fileResponse = await fetch(item.path);
            const fileBuffer = await fileResponse.arrayBuffer();
            const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
            const fileName = item.path.split('/').pop() || 'file';
            const createFileResponse = await (await this.fetch('https://api2.skool.com/files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `auth_token=${cookies.auth_token}; client_id=${cookies.client_id}`,
                },
                body: JSON.stringify({
                    file_name: fileName,
                    content_type: contentType,
                    content_length: fileBuffer.byteLength,
                    content_disposition: '',
                    ref: '',
                    owner_id: userId,
                    large_thumbnail: false,
                }),
            }, 'create file record')).json();
            await fetch(createFileResponse.write_url, {
                method: 'PUT',
                headers: {
                    'Content-Type': createFileResponse.content_type,
                    'x-amz-acl': createFileResponse.acl,
                },
                body: fileBuffer,
            });
            fileIds.push(createFileResponse.file.id);
        }
        return fileIds.join(',');
    }
    async post(id, accessToken, postDetails, integration) {
        const { client_id, auth_token } = this.getCookies(integration);
        const [post] = postDetails;
        const attachments = await this.uploadMediaToSkool(post.media || [], id, { client_id, auth_token });
        const { id: postId, name } = await (await this.fetch('https://api2.skool.com/posts?follow=true', {
            method: 'POST',
            headers: {
                Cookie: `auth_token=${auth_token}; client_id=${client_id}`,
            },
            body: JSON.stringify({
                post_type: 'generic',
                group_id: post.settings.group,
                metadata: {
                    title: post.settings.title,
                    content: post.message,
                    attachments,
                    ...(post.settings.label && post.settings.label !== 'none'
                        ? { labels: post.settings.label }
                        : {}),
                    action: 0,
                    video_ids: '',
                },
            }),
        })).json();
        return [
            {
                id: String(postId),
                postId,
                releaseURL: `https://www.skool.com/${post.settings.group}/${name}`,
                status: 'success',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const { client_id, auth_token } = this.getCookies(integration);
        const [post] = postDetails;
        const attachments = await this.uploadMediaToSkool(post.media || [], id, { client_id, auth_token });
        const { id: postIdFinal, name } = await (await this.fetch('https://api2.skool.com/posts?follow=true', {
            method: 'POST',
            headers: {
                Cookie: `auth_token=${auth_token}; client_id=${client_id}`,
            },
            body: JSON.stringify({
                post_type: 'comment',
                group_id: post.settings.group,
                root_id: postId,
                parent_id: lastCommentId || postId,
                metadata: {
                    title: '',
                    content: post.message,
                    attachments,
                    action: 0,
                    video_ids: '',
                },
            }),
        })).json();
        return [
            {
                id: String(id),
                postId: postIdFinal,
                releaseURL: `https://www.skool.com/${post.settings.group}/${name}`,
                status: 'success',
            },
        ];
    }
}
exports.SkoolProvider = SkoolProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'Groups', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SkoolProvider.prototype, "groups", null);
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'Label', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SkoolProvider.prototype, "label", null);
//# sourceMappingURL=skool.provider.js.map