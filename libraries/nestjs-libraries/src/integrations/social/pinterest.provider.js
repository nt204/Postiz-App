"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinterestProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const pinterest_dto_1 = require("../../dtos/posts/providers-settings/pinterest.dto");
const axios_1 = tslib_1.__importDefault(require("axios"));
const form_data_1 = tslib_1.__importDefault(require("form-data"));
const timer_1 = require("../../../../helpers/src/utils/timer");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const tool_decorator_1 = require("../tool.decorator");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
let PinterestProvider = class PinterestProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'pinterest';
        this.name = 'Pinterest';
        this.isBetweenSteps = false;
        this.scopes = [
            'boards:read',
            'boards:write',
            'pins:read',
            'pins:write',
            'user_accounts:read',
        ];
        this.maxConcurrentJob = 3;
        this.dto = pinterest_dto_1.PinterestSettingsDto;
        this.editor = 'normal';
    }
    maxLength() {
        return 500;
    }
    handleErrors(body) {
        if (body.indexOf('cover_image_url or cover_image_content_type') > -1) {
            return {
                type: 'bad-body',
                value: 'When uploading a video, you must add also an image to be used as a cover image.',
            };
        }
        return undefined;
    }
    async refreshToken(refreshToken) {
        const { access_token, expires_in } = await (await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                scope: this.scopes.join(','),
                redirect_uri: `${process.env.FRONTEND_URL}/integrations/social/pinterest`,
            }),
        })).json();
        const { id, profile_image, username } = await (await fetch('https://api.pinterest.com/v5/user_account', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })).json();
        return {
            id: id,
            name: username,
            accessToken: access_token,
            refreshToken: refreshToken,
            expiresIn: expires_in,
            picture: profile_image || '',
            username,
        };
    }
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(6);
        return {
            url: `https://www.pinterest.com/oauth/?client_id=${process.env.PINTEREST_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.FRONTEND_URL}/integrations/social/pinterest`)}&response_type=code&scope=${encodeURIComponent('boards:read,boards:write,pins:read,pins:write,user_accounts:read')}&state=${state}`,
            codeVerifier: (0, make_is_1.makeId)(10),
            state,
        };
    }
    async authenticate(params) {
        const { access_token, refresh_token, expires_in, scope } = await (await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: params.code,
                redirect_uri: `${process.env.FRONTEND_URL}/integrations/social/pinterest`,
            }),
        })).json();
        this.checkScopes(this.scopes, scope);
        const { id, profile_image, username } = await (await fetch('https://api.pinterest.com/v5/user_account', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })).json();
        return {
            id: id,
            name: username,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in,
            picture: profile_image,
            username,
        };
    }
    async boards(accessToken) {
        const { items } = await (await fetch('https://api.pinterest.com/v5/boards?page_size=250', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return (items?.map((item) => ({
            name: item.name,
            id: item.id,
        })) || []);
    }
    async post(id, accessToken, postDetails) {
        let mediaId = '';
        const findMp4 = postDetails?.[0]?.media?.find((p) => (p.path?.indexOf('mp4') || -1) > -1);
        const picture = postDetails?.[0]?.media?.find((p) => (p.path?.indexOf('mp4') || -1) === -1);
        if (findMp4) {
            const { upload_url, media_id, upload_parameters } = await (await this.fetch('https://api.pinterest.com/v5/media', {
                method: 'POST',
                body: JSON.stringify({
                    media_type: 'video',
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            })).json();
            const { data, status } = await axios_1.default.get(postDetails?.[0]?.media?.[0]?.path, {
                responseType: 'stream',
            });
            const formData = Object.keys(upload_parameters)
                .filter((f) => f)
                .reduce((acc, key) => {
                acc.append(key, upload_parameters[key]);
                return acc;
            }, new form_data_1.default());
            formData.append('file', data);
            await axios_1.default.post(upload_url, formData);
            let statusCode = '';
            while (statusCode !== 'succeeded') {
                const mediafile = await (await this.fetch('https://api.pinterest.com/v5/media/' + media_id, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }, '', 0, true)).json();
                await (0, timer_1.timer)(30000);
                statusCode = mediafile.status;
            }
            mediaId = media_id;
        }
        const mapImages = postDetails?.[0]?.media?.map((m) => ({
            path: m.path,
        }));
        const { id: pId } = await (await this.fetch('https://api.pinterest.com/v5/pins', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...(postDetails?.[0]?.settings.link
                    ? { link: postDetails?.[0]?.settings.link }
                    : {}),
                ...(postDetails?.[0]?.settings.title
                    ? { title: postDetails?.[0]?.settings.title }
                    : {}),
                description: postDetails?.[0]?.message,
                ...(postDetails?.[0]?.settings.dominant_color
                    ? { dominant_color: postDetails?.[0]?.settings.dominant_color }
                    : {}),
                board_id: postDetails?.[0]?.settings.board,
                media_source: mediaId
                    ? {
                        source_type: 'video_id',
                        media_id: mediaId,
                        cover_image_url: picture?.path,
                    }
                    : mapImages?.length === 1
                        ? {
                            source_type: 'image_url',
                            url: mapImages?.[0]?.path,
                        }
                        : {
                            source_type: 'multiple_image_urls',
                            items: mapImages,
                        },
            }),
        })).json();
        return [
            {
                id: postDetails?.[0]?.id,
                postId: pId,
                releaseURL: `https://www.pinterest.com/pin/${pId}`,
                status: 'success',
            },
        ];
    }
    async analytics(id, accessToken, date) {
        const until = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const since = (0, dayjs_1.default)().subtract(date, 'day').format('YYYY-MM-DD');
        const { all: { daily_metrics }, } = await (await fetch(`https://api.pinterest.com/v5/user_account/analytics?start_date=${since}&end_date=${until}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })).json();
        return daily_metrics.reduce((acc, item) => {
            if (typeof item.metrics.PIN_CLICK_RATE !== 'undefined') {
                acc[0].data.push({
                    date: item.date,
                    total: item.metrics.PIN_CLICK_RATE,
                });
                acc[1].data.push({
                    date: item.date,
                    total: item.metrics.IMPRESSION,
                });
                acc[2].data.push({
                    date: item.date,
                    total: item.metrics.PIN_CLICK,
                });
                acc[3].data.push({
                    date: item.date,
                    total: item.metrics.ENGAGEMENT,
                });
                acc[4].data.push({
                    date: item.date,
                    total: item.metrics.SAVE,
                });
            }
            return acc;
        }, [
            { label: 'Pin click rate', data: [] },
            { label: 'Impressions', data: [] },
            { label: 'Pin Clicks', data: [] },
            { label: 'Engagement', data: [] },
            { label: 'Saves', data: [] },
        ]);
    }
    async postAnalytics(integrationId, accessToken, postId, date) {
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const since = (0, dayjs_1.default)().subtract(2, 'year').format('YYYY-MM-DD');
        try {
            const response = await this.fetch(`https://api.pinterest.com/v5/pins/${postId}/analytics?start_date=${since}&end_date=${today}&metric_types=IMPRESSION,PIN_CLICK,OUTBOUND_CLICK,SAVE`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!data || !data.all) {
                return [];
            }
            const result = [];
            const metrics = data.all;
            if (metrics.lifetime_metrics) {
                const lifetimeMetrics = metrics.lifetime_metrics;
                if (lifetimeMetrics.IMPRESSION !== undefined) {
                    result.push({
                        label: 'Impressions',
                        percentageChange: 0,
                        data: [{ total: String(lifetimeMetrics.IMPRESSION), date: today }],
                    });
                }
                if (lifetimeMetrics.PIN_CLICK !== undefined) {
                    result.push({
                        label: 'Pin Clicks',
                        percentageChange: 0,
                        data: [{ total: String(lifetimeMetrics.PIN_CLICK), date: today }],
                    });
                }
                if (lifetimeMetrics.OUTBOUND_CLICK !== undefined) {
                    result.push({
                        label: 'Outbound Clicks',
                        percentageChange: 0,
                        data: [{ total: String(lifetimeMetrics.OUTBOUND_CLICK), date: today }],
                    });
                }
                if (lifetimeMetrics.SAVE !== undefined) {
                    result.push({
                        label: 'Saves',
                        percentageChange: 0,
                        data: [{ total: String(lifetimeMetrics.SAVE), date: today }],
                    });
                }
            }
            return result;
        }
        catch (err) {
            console.error('Error fetching Pinterest post analytics:', err);
            return [];
        }
    }
};
exports.PinterestProvider = PinterestProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'List of boards', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], PinterestProvider.prototype, "boards", null);
exports.PinterestProvider = PinterestProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)('Pinterest requires at least one media, if posting a video, you must have two attachment, one for video, one for the cover picture, When posting a video, there can be only one')
], PinterestProvider);
//# sourceMappingURL=pinterest.provider.js.map