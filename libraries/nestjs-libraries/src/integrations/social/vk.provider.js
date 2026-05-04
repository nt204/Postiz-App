"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VkProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const social_abstract_1 = require("../social.abstract");
const crypto_1 = require("crypto");
const axios_1 = tslib_1.__importDefault(require("axios"));
const form_data_1 = tslib_1.__importDefault(require("form-data"));
const mime_types_1 = tslib_1.__importDefault(require("mime-types"));
class VkProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 2;
        this.identifier = 'vk';
        this.name = 'VK';
        this.isBetweenSteps = false;
        this.scopes = [
            'vkid.personal_info',
            'email',
            'wall',
            'status',
            'docs',
            'photos',
            'video',
        ];
        this.editor = 'normal';
    }
    maxLength() {
        return 2048;
    }
    async refreshToken(refresh) {
        const [oldRefreshToken, device_id] = refresh.split('&&&&');
        const formData = new FormData();
        formData.append('grant_type', 'refresh_token');
        formData.append('refresh_token', oldRefreshToken);
        formData.append('client_id', process.env.VK_ID);
        formData.append('device_id', device_id);
        formData.append('state', (0, make_is_1.makeId)(32));
        formData.append('scope', this.scopes.join(' '));
        const { access_token, refresh_token, expires_in } = await (await this.fetch('https://id.vk.com/oauth2/auth', {
            method: 'POST',
            body: formData,
        })).json();
        const newFormData = new FormData();
        newFormData.append('client_id', process.env.VK_ID);
        newFormData.append('access_token', access_token);
        const { user: { user_id, first_name, last_name, avatar }, } = await (await this.fetch('https://id.vk.com/oauth2/user_info', {
            method: 'POST',
            body: newFormData,
        })).json();
        return {
            id: user_id,
            name: first_name + ' ' + last_name,
            accessToken: access_token,
            refreshToken: refresh_token + '&&&&' + device_id,
            expiresIn: (0, dayjs_1.default)().add(expires_in, 'seconds').unix() - (0, dayjs_1.default)().unix(),
            picture: avatar || '',
            username: first_name.toLowerCase(),
        };
    }
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(32);
        const codeVerifier = (0, crypto_1.randomBytes)(64).toString('base64url');
        const challenge = Buffer.from((0, crypto_1.createHash)('sha256').update(codeVerifier).digest())
            .toString('base64')
            .replace(/=*$/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        return {
            url: 'https://id.vk.com/authorize' +
                `?response_type=code` +
                `&client_id=${process.env.VK_ID}` +
                `&code_challenge_method=S256` +
                `&code_challenge=${challenge}` +
                `&redirect_uri=${encodeURIComponent(`${process?.env.FRONTEND_URL?.indexOf('https') == -1
                    ? `https://redirectmeto.com/${process?.env.FRONTEND_URL}`
                    : `${process?.env.FRONTEND_URL}`}/integrations/social/vk`)}` +
                `&state=${state}` +
                `&scope=${encodeURIComponent(this.scopes.join(' '))}`,
            codeVerifier,
            state,
        };
    }
    async authenticate(params) {
        const [code, device_id] = params.code.split('&&&&');
        const formData = new FormData();
        formData.append('client_id', process.env.VK_ID);
        formData.append('grant_type', 'authorization_code');
        formData.append('code_verifier', params.codeVerifier);
        formData.append('device_id', device_id);
        formData.append('code', code);
        formData.append('redirect_uri', `${process?.env.FRONTEND_URL?.indexOf('https') == -1
            ? `https://redirectmeto.com/${process?.env.FRONTEND_URL}`
            : `${process?.env.FRONTEND_URL}`}/integrations/social/vk`);
        const { access_token, scope, refresh_token, expires_in } = await (await this.fetch('https://id.vk.com/oauth2/auth', {
            method: 'POST',
            body: formData,
        })).json();
        const newFormData = new FormData();
        newFormData.append('client_id', process.env.VK_ID);
        newFormData.append('access_token', access_token);
        const { user: { user_id, first_name, last_name, avatar }, } = await (await this.fetch('https://id.vk.com/oauth2/user_info', {
            method: 'POST',
            body: newFormData,
        })).json();
        return {
            id: user_id,
            name: first_name + ' ' + last_name,
            accessToken: access_token,
            refreshToken: refresh_token + '&&&&' + device_id,
            expiresIn: (0, dayjs_1.default)().add(expires_in, 'seconds').unix() - (0, dayjs_1.default)().unix(),
            picture: avatar || '',
            username: first_name.toLowerCase(),
        };
    }
    async uploadMedia(userId, accessToken, post) {
        return await Promise.all((post?.media || []).map(async (media) => {
            const all = await (await this.fetch(media.path.indexOf('mp4') > -1
                ? `https://api.vk.com/method/video.save?access_token=${accessToken}&v=5.251`
                : `https://api.vk.com/method/photos.getWallUploadServer?owner_id=${userId}&access_token=${accessToken}&v=5.251`)).json();
            const { data } = await axios_1.default.get(media.path, {
                responseType: 'stream',
            });
            const slash = media.path.split('/').at(-1);
            const formData = new form_data_1.default();
            formData.append('photo', data, {
                filename: slash,
                contentType: mime_types_1.default.lookup(slash) || '',
            });
            const value = (await axios_1.default.post(all.response.upload_url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            })).data;
            if (media.path.indexOf('mp4') > -1) {
                return {
                    id: all.response.video_id,
                    type: 'video',
                };
            }
            const formSend = new FormData();
            formSend.append('photo', value.photo);
            formSend.append('server', value.server);
            formSend.append('hash', value.hash);
            const { id } = (await (await fetch(`https://api.vk.com/method/photos.saveWallPhoto?access_token=${accessToken}&v=5.251`, {
                method: 'POST',
                body: formSend,
            })).json()).response[0];
            return {
                id,
                type: 'photo',
            };
        }));
    }
    async post(userId, accessToken, postDetails) {
        const [firstPost] = postDetails;
        const mediaList = await this.uploadMedia(userId, accessToken, firstPost);
        const body = new FormData();
        body.append('message', firstPost.message);
        if (mediaList.length) {
            body.append('attachments', mediaList.map((p) => `${p.type}${userId}_${p.id}`).join(','));
        }
        const { response } = await (await this.fetch(`https://api.vk.com/method/wall.post?v=5.251&access_token=${accessToken}&client_id=${process.env.VK_ID}`, {
            method: 'POST',
            body,
        })).json();
        return [
            {
                id: firstPost.id,
                postId: String(response?.post_id),
                releaseURL: `https://vk.com/feed?w=wall${userId}_${response?.post_id}`,
                status: 'completed',
            },
        ];
    }
    async comment(userId, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const mediaList = await this.uploadMedia(userId, accessToken, commentPost);
        const body = new FormData();
        body.append('message', commentPost.message);
        body.append('post_id', postId);
        if (mediaList.length) {
            body.append('attachments', mediaList.map((p) => `${p.type}${userId}_${p.id}`).join(','));
        }
        const { response } = await (await this.fetch(`https://api.vk.com/method/wall.createComment?v=5.251&access_token=${accessToken}&client_id=${process.env.VK_ID}`, {
            method: 'POST',
            body,
        })).json();
        return [
            {
                id: commentPost.id,
                postId: String(response?.comment_id),
                releaseURL: `https://vk.com/feed?w=wall${userId}_${postId}`,
                status: 'completed',
            },
        ];
    }
}
exports.VkProvider = VkProvider;
//# sourceMappingURL=vk.provider.js.map