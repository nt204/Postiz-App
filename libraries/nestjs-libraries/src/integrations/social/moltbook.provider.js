"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoltbookProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const MOLTBOOK_API_BASE = 'https://www.moltbook.com/api/v1';
class MoltbookProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 100;
        this.identifier = 'moltbook';
        this.name = 'Moltbook';
        this.isBetweenSteps = false;
        this.scopes = [];
        this.isWeb3 = true;
        this.editor = 'normal';
    }
    maxLength() {
        return 300;
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
    async registerAgent(name, description) {
        const response = await axios_1.default.post(`${MOLTBOOK_API_BASE}/agents/register`, { name, description }, { headers: { 'Content-Type': 'application/json' } });
        if (!response.data.success) {
            throw new Error(response.data.error || 'Registration failed');
        }
        return response.data.agent;
    }
    async checkAgentStatus(apiKey) {
        const response = await axios_1.default.get(`${MOLTBOOK_API_BASE}/agents/status`, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        return response.data;
    }
    async getAgentProfile(apiKey) {
        const response = await axios_1.default.get(`${MOLTBOOK_API_BASE}/agents/me`, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to get profile');
        }
        return response.data.agent;
    }
    async authenticate(params) {
        const apiKey = params.code;
        const profile = await this.getAgentProfile(apiKey);
        return {
            id: profile.name || profile.id,
            name: profile.display_name || profile.name,
            accessToken: apiKey,
            refreshToken: '',
            expiresIn: (0, dayjs_1.default)().add(200, 'year').unix() - (0, dayjs_1.default)().unix(),
            picture: '',
            username: profile.name,
        };
    }
    async post(id, accessToken, postDetails, integration) {
        const results = [];
        for (const post of postDetails) {
            const postData = {
                submolt: post.settings?.submolt || 'general',
                title: post.message.slice(0, 100),
                content: post.message,
            };
            const response = await axios_1.default.post(`${MOLTBOOK_API_BASE}/posts`, postData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to create post');
            }
            const postId = response.data.post.id;
            results.push({
                id: post.id,
                postId: String(postId),
                releaseURL: `https://www.moltbook.com/post/${postId}`,
                status: 'completed',
            });
        }
        return results;
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const results = [];
        for (const post of postDetails) {
            const commentData = {
                content: post.message,
            };
            if (lastCommentId) {
                commentData.parent_id = lastCommentId;
            }
            const response = await axios_1.default.post(`${MOLTBOOK_API_BASE}/posts/${postId}/comments`, commentData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to create comment');
            }
            const commentId = response.data.comment.id;
            results.push({
                id: post.id,
                postId: String(commentId),
                releaseURL: `https://www.moltbook.com/post/${postId}`,
                status: 'completed',
            });
        }
        return results;
    }
}
exports.MoltbookProvider = MoltbookProvider;
//# sourceMappingURL=moltbook.provider.js.map