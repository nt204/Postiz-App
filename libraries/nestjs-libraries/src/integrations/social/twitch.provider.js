"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitchProvider = void 0;
const make_is_1 = require("../../services/make.is");
const social_abstract_1 = require("../social.abstract");
const twitch_dto_1 = require("../../dtos/posts/providers-settings/twitch.dto");
const timer_1 = require("../../../../helpers/src/utils/timer");
class TwitchProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 1;
        this.identifier = 'twitch';
        this.name = 'Twitch';
        this.isBetweenSteps = false;
        this.editor = 'normal';
        this.scopes = ['user:write:chat', 'user:read:chat', 'moderator:manage:announcements'];
        this.dto = twitch_dto_1.TwitchDto;
    }
    maxLength() {
        return 500;
    }
    async refreshToken(refreshToken) {
        const response = await this.fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
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
        const redirectUri = `${process.env.FRONTEND_URL}/integrations/social/twitch`;
        const url = `https://id.twitch.tv/oauth2/authorize` +
            `?response_type=code` +
            `&client_id=${process.env.TWITCH_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&scope=${encodeURIComponent(this.scopes.join(' '))}` +
            `&state=${state}`;
        return {
            url,
            codeVerifier: (0, make_is_1.makeId)(10),
            state,
        };
    }
    async authenticate(params) {
        const redirectUri = `${process.env.FRONTEND_URL}/integrations/social/twitch${params.refresh ? `?refresh=${params.refresh}` : ''}`;
        const tokenResponse = await this.fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                redirect_uri: redirectUri,
                code: params.code,
            }),
        });
        const { access_token, refresh_token, expires_in } = await tokenResponse.json();
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
        const userResponse = await fetch('https://api.twitch.tv/helix/users', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
        });
        const userData = await userResponse.json();
        const user = userData.data?.[0];
        return {
            id: String(user.id),
            name: user.display_name,
            username: user.login,
            picture: user.profile_image_url || '',
        };
    }
    async sendAnnouncement(broadcasterId, accessToken, message, color = 'primary') {
        await fetch(`https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${broadcasterId}&moderator_id=${broadcasterId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message.substring(0, 500),
                color,
            }),
        });
        return { success: true };
    }
    async sendChatMessage(broadcasterId, accessToken, message, replyToMessageId) {
        const body = {
            broadcaster_id: broadcasterId,
            sender_id: broadcasterId,
            message: message.substring(0, 500),
        };
        if (replyToMessageId) {
            body.reply_parent_message_id = replyToMessageId;
        }
        const response = await this.fetch('https://api.twitch.tv/helix/chat/messages', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return {
            messageId: data.data?.[0]?.message_id || (0, make_is_1.makeId)(10),
            isSent: data.data?.[0]?.is_sent ?? false,
        };
    }
    async post(id, accessToken, postDetails, integration) {
        await (0, timer_1.timer)(2000);
        const [firstPost] = postDetails;
        const messageType = firstPost.settings?.messageType || 'message';
        const announcementColor = firstPost.settings?.announcementColor || 'primary';
        if (messageType === 'announcement') {
            const result = await this.sendAnnouncement(id, accessToken, firstPost.message, announcementColor);
            return [
                {
                    id: firstPost.id,
                    postId: (0, make_is_1.makeId)(10),
                    releaseURL: `https://twitch.tv/${integration.profile || integration.providerIdentifier}`,
                    status: result.success ? 'posted' : 'error',
                },
            ];
        }
        const result = await this.sendChatMessage(id, accessToken, firstPost.message);
        return [
            {
                id: firstPost.id,
                postId: result.messageId,
                releaseURL: `https://twitch.tv/${integration.profile || integration.providerIdentifier}`,
                status: result.isSent ? 'posted' : 'error',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        await (0, timer_1.timer)(2000);
        const [commentPost] = postDetails;
        const messageType = commentPost.settings?.messageType || 'message';
        const announcementColor = commentPost.settings?.announcementColor || 'primary';
        if (messageType === 'announcement') {
            const result = await this.sendAnnouncement(id, accessToken, commentPost.message, announcementColor);
            return [
                {
                    id: commentPost.id,
                    postId: (0, make_is_1.makeId)(10),
                    releaseURL: `https://twitch.tv/${integration.profile || integration.providerIdentifier}`,
                    status: result.success ? 'posted' : 'error',
                },
            ];
        }
        const result = await this.sendChatMessage(id, accessToken, commentPost.message, lastCommentId || postId);
        return [
            {
                id: commentPost.id,
                postId: result.messageId,
                releaseURL: `https://twitch.tv/${integration.profile || integration.providerIdentifier}`,
                status: result.isSent ? 'posted' : 'error',
            },
        ];
    }
}
exports.TwitchProvider = TwitchProvider;
//# sourceMappingURL=twitch.provider.js.map