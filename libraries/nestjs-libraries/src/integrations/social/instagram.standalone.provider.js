"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramStandaloneProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const social_abstract_1 = require("../social.abstract");
const instagram_dto_1 = require("../../dtos/posts/providers-settings/instagram.dto");
const instagram_provider_1 = require("./instagram.provider");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
const instagramProvider = new instagram_provider_1.InstagramProvider();
let InstagramStandaloneProvider = class InstagramStandaloneProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'instagram-standalone';
        this.name = 'Instagram\n(Standalone)';
        this.isBetweenSteps = false;
        this.refreshCron = true;
        this.scopes = [
            'instagram_business_basic',
            'instagram_business_content_publish',
            'instagram_business_manage_comments',
            'instagram_business_manage_insights',
        ];
        this.maxConcurrentJob = 200;
        this.dto = instagram_dto_1.InstagramDto;
        this.editor = 'normal';
    }
    maxLength() {
        return 2200;
    }
    handleErrors(body, status) {
        return instagramProvider.handleErrors(body, status);
    }
    async refreshToken(refresh_token) {
        const { access_token } = await (await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${refresh_token}`)).json();
        const { user_id, name, username, profile_picture_url = '', } = await (await fetch(`https://graph.instagram.com/v21.0/me?fields=user_id,username,name,profile_picture_url&access_token=${access_token}`)).json();
        return {
            id: user_id,
            name,
            accessToken: access_token,
            refreshToken: access_token,
            expiresIn: (0, dayjs_1.default)().add(58, 'days').unix() - (0, dayjs_1.default)().unix(),
            picture: profile_picture_url || '',
            username,
        };
    }
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(6);
        return {
            url: `https://www.instagram.com/oauth/authorize?enable_fb_login=0&client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(`${process?.env.FRONTEND_URL?.indexOf('https') == -1
                ? `https://redirectmeto.com/${process?.env.FRONTEND_URL}`
                : `${process?.env.FRONTEND_URL}`}/integrations/social/instagram-standalone`)}&response_type=code&scope=${encodeURIComponent(this.scopes.join(','))}` + `&state=${state}`,
            codeVerifier: (0, make_is_1.makeId)(10),
            state,
        };
    }
    async authenticate(params) {
        const formData = new FormData();
        formData.append('client_id', process.env.INSTAGRAM_APP_ID);
        formData.append('client_secret', process.env.INSTAGRAM_APP_SECRET);
        formData.append('grant_type', 'authorization_code');
        formData.append('redirect_uri', `${process?.env.FRONTEND_URL?.indexOf('https') == -1
            ? `https://redirectmeto.com/${process?.env.FRONTEND_URL}`
            : `${process?.env.FRONTEND_URL}`}/integrations/social/instagram-standalone`);
        formData.append('code', params.code);
        const getAccessToken = await (await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            body: formData,
        })).json();
        const { access_token, expires_in, ...all } = await (await fetch('https://graph.instagram.com/access_token' +
            '?grant_type=ig_exchange_token' +
            `&client_id=${process.env.INSTAGRAM_APP_ID}` +
            `&client_secret=${process.env.INSTAGRAM_APP_SECRET}` +
            `&access_token=${getAccessToken.access_token}`)).json();
        this.checkScopes(this.scopes, getAccessToken.permissions);
        const { user_id, name, username, profile_picture_url } = await (await fetch(`https://graph.instagram.com/v21.0/me?fields=user_id,username,name,profile_picture_url&access_token=${access_token}`)).json();
        return {
            id: user_id,
            name,
            accessToken: access_token,
            refreshToken: access_token,
            expiresIn: (0, dayjs_1.default)().add(58, 'days').unix() - (0, dayjs_1.default)().unix(),
            picture: profile_picture_url,
            username,
        };
    }
    async post(id, accessToken, postDetails, integration) {
        return instagramProvider.post(id, accessToken, postDetails, integration, 'graph.instagram.com');
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        return instagramProvider.comment(id, postId, lastCommentId, accessToken, postDetails, integration, 'graph.instagram.com');
    }
    async analytics(id, accessToken, date) {
        return instagramProvider.analytics(id, accessToken, date, 'graph.instagram.com');
    }
    async postAnalytics(integrationId, accessToken, postId, date) {
        return instagramProvider.postAnalytics(integrationId, accessToken, postId, date, 'graph.instagram.com');
    }
};
exports.InstagramStandaloneProvider = InstagramStandaloneProvider;
exports.InstagramStandaloneProvider = InstagramStandaloneProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)("Instagram should have at least one attachment, if it's a story, it can have only one picture")
], InstagramStandaloneProvider);
//# sourceMappingURL=instagram.standalone.provider.js.map