"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KickProvider = void 0;
const make_is_1 = require("../../services/make.is");
const social_abstract_1 = require("../social.abstract");
const kick_dto_1 = require("../../dtos/posts/providers-settings/kick.dto");
const crypto_1 = require("crypto");
class KickProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 3;
        this.identifier = 'kick';
        this.name = 'Kick';
        this.isBetweenSteps = false;
        this.editor = 'normal';
        this.scopes = ['chat:write', 'user:read', 'channel:read'];
        this.dto = kick_dto_1.KickDto;
    }
    maxLength() {
        return 500;
    }
    generatePKCE() {
        const codeVerifier = (0, crypto_1.randomBytes)(64).toString('base64url');
        const challenge = Buffer.from((0, crypto_1.createHash)('sha256').update(codeVerifier).digest())
            .toString('base64')
            .replace(/=*$/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        return { codeVerifier, codeChallenge: challenge };
    }
    async refreshToken(refreshToken) {
        const response = await this.fetch('https://id.kick.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: process.env.KICK_CLIENT_ID,
                client_secret: process.env.KICK_SECRET,
                refresh_token: refreshToken,
            }),
        });
        const { access_token, refresh_token, expires_in } = await response.json();
        const userInfo = await this.getUserInfo(access_token);
        return {
            refreshToken: refresh_token,
            expiresIn: expires_in,
            accessToken: access_token,
            id: userInfo.id,
            name: userInfo.name,
            picture: userInfo.picture || '',
            username: userInfo.username,
        };
    }
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(32);
        const { codeVerifier, codeChallenge } = this.generatePKCE();
        const redirectUri = `${process.env.FRONTEND_URL}/integrations/social/kick`;
        const url = `https://id.kick.com/oauth/authorize` +
            `?response_type=code` +
            `&client_id=${process.env.KICK_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&scope=${encodeURIComponent(this.scopes.join(' '))}` +
            `&state=${state}` +
            `&code_challenge=${codeChallenge}` +
            `&code_challenge_method=S256`;
        return {
            url,
            codeVerifier,
            state,
        };
    }
    async authenticate(params) {
        const redirectUri = `${process.env.FRONTEND_URL}/integrations/social/kick${params.refresh ? `?refresh=${params.refresh}` : ''}`;
        const tokenResponse = await this.fetch('https://id.kick.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.KICK_CLIENT_ID,
                client_secret: process.env.KICK_SECRET,
                redirect_uri: redirectUri,
                code: params.code,
                code_verifier: params.codeVerifier,
            }),
        });
        const { access_token, refresh_token, expires_in, scope } = await tokenResponse.json();
        const userInfo = await this.getUserInfo(access_token);
        return {
            id: userInfo.id,
            name: userInfo.name,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in,
            picture: userInfo.picture || '',
            username: userInfo.username,
        };
    }
    async getUserInfo(accessToken) {
        const userResponse = await fetch('https://api.kick.com/public/v1/users', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const userData = await userResponse.json();
        const user = userData.data?.[0] || userData.data;
        return {
            id: String(user.user_id || user.id),
            name: user.name,
            username: user.name,
            picture: user.profile_picture || '',
        };
    }
    async post(id, accessToken, postDetails, integration) {
        const [firstPost] = postDetails;
        const response = await this.fetch('https://api.kick.com/public/v1/chat', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'user',
                content: firstPost.message.substring(0, 500),
                broadcaster_user_id: parseInt(id, 10),
            }),
        });
        const data = await response.json();
        return [
            {
                id: firstPost.id,
                postId: data.data?.message_id || data.message_id || (0, make_is_1.makeId)(10),
                releaseURL: `https://kick.com/${integration.profile || 'channel'}`,
                status: data.data?.is_sent || data.is_sent ? 'posted' : 'error',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const response = await this.fetch('https://api.kick.com/public/v1/chat', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'user',
                content: commentPost.message.substring(0, 500),
                broadcaster_user_id: parseInt(id, 10),
                reply_to_message_id: lastCommentId || postId,
            }),
        });
        const data = await response.json();
        return [
            {
                id: commentPost.id,
                postId: data.data?.message_id || data.message_id || (0, make_is_1.makeId)(10),
                releaseURL: `https://kick.com/${integration.profile || 'channel'}`,
                status: data.data?.is_sent || data.is_sent ? 'posted' : 'error',
            },
        ];
    }
}
exports.KickProvider = KickProvider;
//# sourceMappingURL=kick.provider.js.map