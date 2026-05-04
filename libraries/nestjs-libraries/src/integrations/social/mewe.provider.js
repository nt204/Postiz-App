"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeweProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const mewe_dto_1 = require("../../dtos/posts/providers-settings/mewe.dto");
const tool_decorator_1 = require("../tool.decorator");
class MeweProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'mewe';
        this.name = 'MeWe';
        this.isBetweenSteps = false;
        this.scopes = [];
        this.editor = 'normal';
        this.dto = mewe_dto_1.MeweDto;
    }
    get meweHost() {
        return process.env.MEWE_HOST || 'https://mewe.com';
    }
    authHeaders(apiToken) {
        return {
            'X-App-Id': process.env.MEWE_APP_ID,
            'X-Api-Key': process.env.MEWE_API_KEY,
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        };
    }
    maxLength() {
        return 63206;
    }
    handleErrors(body) {
        if (body.indexOf('Unauthorized') > -1) {
            return {
                type: 'refresh-token',
                value: 'Access token expired, please re-authenticate',
            };
        }
        if (body.indexOf('Enhance Your Calm') > -1 || body.indexOf('420') > -1) {
            return {
                type: 'retry',
                value: 'Rate limited, retrying...',
            };
        }
        if (body.indexOf('Forbidden') > -1) {
            return {
                type: 'bad-body',
                value: 'Insufficient permissions for this action',
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
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(6);
        return {
            url: `${this.meweHost}/login` +
                `?client_id=${process.env.MEWE_APP_ID}` +
                `&redirect_uri=${encodeURIComponent(`${process.env.FRONTEND_URL}/integrations/social/mewe`)}` +
                `&state=${state}`,
            codeVerifier: (0, make_is_1.makeId)(10),
            state,
        };
    }
    async authenticate(params) {
        const loginRequestToken = params.code;
        if (!loginRequestToken) {
            return 'No login request token received. Please try again.';
        }
        try {
            const tokenResponse = await fetch(`${this.meweHost}/api/dev/token?loginRequestToken=${loginRequestToken}`, {
                method: 'GET',
                headers: {
                    'X-App-Id': process.env.MEWE_APP_ID,
                    'X-Api-Key': process.env.MEWE_API_KEY,
                },
            });
            if (!tokenResponse.ok) {
                return 'Failed to exchange token. Please try again.';
            }
            const tokenData = await tokenResponse.json();
            if (tokenData.pending) {
                return 'Login request is still pending. Please approve on MeWe and try again.';
            }
            if (!tokenData.apiToken) {
                return 'No API token received. Please try again.';
            }
            const apiToken = tokenData.apiToken;
            const expiresAt = tokenData.expiresAt;
            const profileResponse = await fetch(`${this.meweHost}/api/dev/me`, {
                method: 'GET',
                headers: this.authHeaders(apiToken),
            });
            if (!profileResponse.ok) {
                return 'Failed to fetch MeWe profile.';
            }
            const profile = await profileResponse.json();
            const expiresIn = expiresAt
                ? (0, dayjs_1.default)(expiresAt).unix() - (0, dayjs_1.default)().unix()
                : (0, dayjs_1.default)().add(30, 'days').unix() - (0, dayjs_1.default)().unix();
            return {
                id: profile.userId,
                name: profile.name ||
                    `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                accessToken: apiToken,
                refreshToken: '',
                expiresIn,
                picture: '',
                username: profile.handle || '',
            };
        }
        catch (e) {
            console.log(e);
            return 'MeWe authentication failed. Please try again.';
        }
    }
    async groups(accessToken, params, id, integration) {
        try {
            const allGroups = [];
            let nextUrl = `${this.meweHost}/api/dev/groups`;
            while (nextUrl) {
                const response = await fetch(nextUrl, {
                    method: 'GET',
                    headers: this.authHeaders(accessToken),
                });
                if (!response.ok)
                    break;
                const data = await response.json();
                allGroups.push(...(data.groups || []));
                nextUrl = data.nextPage ? `${this.meweHost}${data.nextPage}` : null;
            }
            return allGroups.map((group) => ({
                id: String(group.groupId),
                name: group.name,
            }));
        }
        catch (err) {
            return [];
        }
    }
    async uploadPhoto(accessToken, mediaPath) {
        const mediaResponse = await fetch(mediaPath);
        const blob = await mediaResponse.blob();
        const fileName = mediaPath.split('/').pop() || 'photo.jpg';
        const form = new FormData();
        form.append('file', blob, fileName);
        const uploadResponse = await fetch(`${this.meweHost}/api/dev/photo/upload`, {
            method: 'POST',
            headers: {
                'X-App-Id': process.env.MEWE_APP_ID,
                'X-Api-Key': process.env.MEWE_API_KEY,
                Authorization: `Bearer ${accessToken}`,
            },
            body: form,
        });
        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Photo upload failed: ${errorText}`);
        }
        const uploadData = await uploadResponse.json();
        return uploadData.id;
    }
    async post(id, accessToken, postDetails, integration) {
        const [firstPost] = postDetails;
        const postType = firstPost.settings.postType || 'group';
        const groupId = firstPost.settings.group;
        const imageMedia = firstPost.media?.filter((m) => !m.path || m.path.indexOf('mp4') === -1) ||
            [];
        const uploadedPhotoIds = [];
        for (const media of imageMedia) {
            const photoId = await this.uploadPhoto(accessToken, media.path);
            uploadedPhotoIds.push(photoId);
        }
        const postBody = { text: firstPost.message };
        if (uploadedPhotoIds.length > 0) {
            postBody.uploadedPhotoIds = uploadedPhotoIds;
        }
        const postUrl = postType === 'timeline'
            ? `${this.meweHost}/api/dev/me/post`
            : `${this.meweHost}/api/dev/group/${groupId}/post`;
        const postResponse = await fetch(postUrl, {
            method: 'POST',
            headers: this.authHeaders(accessToken),
            body: JSON.stringify(postBody),
        });
        if (!postResponse.ok) {
            const errorText = await postResponse.text();
            const handleError = this.handleErrors(errorText);
            if (handleError) {
                throw new Error(handleError.value);
            }
            throw new Error('Failed to create MeWe post');
        }
        const postId = (0, make_is_1.makeId)(12);
        const releaseURL = postType === 'timeline' ? `https://mewe.com/${integration.profile}/posts` : `https://mewe.com/group/${firstPost.settings.group}`;
        return [
            {
                id: firstPost.id,
                postId,
                releaseURL,
                status: 'success',
            },
        ];
    }
}
exports.MeweProvider = MeweProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'Groups', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], MeweProvider.prototype, "groups", null);
//# sourceMappingURL=mewe.provider.js.map