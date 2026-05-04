"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhopProvider = void 0;
const tslib_1 = require("tslib");
const crypto_1 = require("crypto");
const make_is_1 = require("../../services/make.is");
const timer_1 = require("../../../../helpers/src/utils/timer");
const social_abstract_1 = require("../social.abstract");
const whop_dto_1 = require("../../dtos/posts/providers-settings/whop.dto");
const tool_decorator_1 = require("../tool.decorator");
class WhopProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'whop';
        this.name = 'Whop';
        this.isBetweenSteps = false;
        this.scopes = ['openid', 'profile', 'email', 'forum:post:create', 'forum:read', 'company:basic:read'];
        this.refreshCron = false;
        this.editor = 'markdown';
        this.dto = whop_dto_1.WhopDto;
        this.toolTip = 'Schedule posts to forums';
    }
    maxLength() {
        return 50000;
    }
    generateCodeChallenge(codeVerifier) {
        return (0, crypto_1.createHash)('sha256').update(codeVerifier).digest('base64url');
    }
    handleErrors(body) {
        if (body.includes('invalid_grant')) {
            return {
                type: 'refresh-token',
                value: 'Invalid token, please re-authenticate',
            };
        }
        if (body.includes('insufficient_scope')) {
            return {
                type: 'refresh-token',
                value: 'Insufficient permissions, please re-authenticate with required scopes',
            };
        }
        if (body.includes('invalid_request')) {
            return {
                type: 'bad-body',
                value: 'Invalid request parameters',
            };
        }
        if (body.includes('not_found')) {
            return {
                type: 'bad-body',
                value: 'Forum or experience not found',
            };
        }
        return undefined;
    }
    async refreshToken(refreshToken) {
        const response = await (await fetch('https://api.whop.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: process.env.WHOP_CLIENT_ID,
            }),
        })).json();
        const userInfo = await (await fetch('https://api.whop.com/oauth/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
        })).json();
        return {
            id: userInfo.sub,
            name: userInfo.name || userInfo.preferred_username || '',
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiresIn: response.expires_in || 3600,
            picture: userInfo.picture || '',
            username: userInfo.preferred_username || '',
        };
    }
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(6);
        const codeVerifier = (0, crypto_1.randomBytes)(32).toString('base64url');
        const codeChallenge = this.generateCodeChallenge(codeVerifier);
        const nonce = (0, make_is_1.makeId)(16);
        return {
            url: 'https://api.whop.com/oauth/authorize' +
                `?response_type=code` +
                `&client_id=${process.env.WHOP_CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(`${process.env.FRONTEND_URL}/integrations/social/whop`)}` +
                `&scope=${encodeURIComponent(this.scopes.join(' '))}` +
                `&state=${state}` +
                `&nonce=${nonce}` +
                `&code_challenge=${codeChallenge}` +
                `&code_challenge_method=S256`,
            codeVerifier,
            state,
        };
    }
    async authenticate(params) {
        const redirectUri = `${process.env.FRONTEND_URL}/integrations/social/whop${params.refresh ? `?refresh=${params.refresh}` : ''}`;
        const tokenResponse = await (await fetch('https://api.whop.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: params.code,
                redirect_uri: redirectUri,
                client_id: process.env.WHOP_CLIENT_ID,
                code_verifier: params.codeVerifier,
            }),
        })).json();
        if (tokenResponse.error) {
            return `Authentication failed: ${tokenResponse.error_description || tokenResponse.error}`;
        }
        const userInfo = await (await fetch('https://api.whop.com/oauth/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })).json();
        return {
            id: userInfo.sub,
            name: userInfo.name || userInfo.preferred_username || '',
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresIn: tokenResponse.expires_in || 3600,
            picture: userInfo.picture || '',
            username: userInfo.preferred_username || '',
        };
    }
    async companies(accessToken, params, id) {
        try {
            const response = await fetch('https://api.whop.com/api/v1/companies?first=50', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const { data } = await response.json();
            return (data || []).map((company) => ({
                id: company.id,
                name: company.title,
            }));
        }
        catch {
            return [];
        }
    }
    async experiences(accessToken, params, id) {
        try {
            if (!params?.id)
                return [];
            const response = await fetch(`https://api.whop.com/api/v1/forums?company_id=${params.id}&first=50`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const { data } = await response.json();
            return (data || []).map((forum) => ({
                id: forum.experience?.id || forum.id,
                name: forum.experience?.name || forum.id,
            }));
        }
        catch {
            return [];
        }
    }
    async uploadMediaToWhop(media, accessToken) {
        if (!media || media.length === 0)
            return [];
        const attachments = [];
        for (const item of media) {
            const fileResponse = await fetch(item.path);
            const fileBuffer = await fileResponse.arrayBuffer();
            const fileName = item.path.split('/').pop() || 'file';
            const createFileResponse = await (await this.fetch('https://api.whop.com/api/v1/files', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: fileName,
                }),
            }, 'create file record')).json();
            if (createFileResponse.upload_url) {
                await fetch(createFileResponse.upload_url, {
                    method: 'PUT',
                    headers: createFileResponse.upload_headers || {},
                    body: fileBuffer,
                });
                let uploadStatus = 'pending';
                while (uploadStatus !== 'ready') {
                    const fileStatus = await (await this.fetch(`https://api.whop.com/api/v1/files/${createFileResponse.id}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }, 'check file status', 0, true)).json();
                    uploadStatus = fileStatus.upload_status;
                    if (uploadStatus === 'failed') {
                        throw new Error('File upload failed');
                    }
                    if (uploadStatus !== 'ready') {
                        await (0, timer_1.timer)(5000);
                    }
                }
            }
            attachments.push({ id: createFileResponse.id });
        }
        return attachments;
    }
    async post(id, accessToken, postDetails, integration) {
        const [post] = postDetails;
        const attachments = await this.uploadMediaToWhop(post.media || [], accessToken);
        const data = await (await this.fetch('https://api.whop.com/api/v1/forum_posts', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                experience_id: post.settings.experience,
                content: post.message,
                ...(post.settings.title ? { title: post.settings.title } : {}),
                ...(attachments.length ? { attachments } : {}),
            }),
        }, 'create forum post')).json();
        return [
            {
                id: post.id,
                postId: data.id,
                releaseURL: `https://whop.com/experiences/${post.settings.experience}/${data.id}`,
                status: 'success',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [post] = postDetails;
        const replyToId = lastCommentId || postId;
        const attachments = await this.uploadMediaToWhop(post.media || [], accessToken);
        const data = await (await this.fetch('https://api.whop.com/api/v1/forum_posts', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                experience_id: post.settings.experience,
                content: post.message,
                parent_id: replyToId,
                ...(attachments.length ? { attachments } : {}),
            }),
        }, 'create comment')).json();
        return [
            {
                id: post.id,
                postId: data.id,
                releaseURL: `https://whop.com/experiences/${post.settings.experience}/${postId}`,
                status: 'success',
            },
        ];
    }
}
exports.WhopProvider = WhopProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'Companies', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], WhopProvider.prototype, "companies", null);
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'Experiences', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], WhopProvider.prototype, "experiences", null);
//# sourceMappingURL=whop.provider.js.map