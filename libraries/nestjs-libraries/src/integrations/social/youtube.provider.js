"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const googleapis_1 = require("googleapis");
const axios_1 = tslib_1.__importDefault(require("axios"));
const youtube_settings_dto_1 = require("../../dtos/posts/providers-settings/youtube.settings.dto");
const social_abstract_1 = require("../social.abstract");
const process = tslib_1.__importStar(require("node:process"));
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
const clientAndYoutube = () => {
    const client = new googleapis_1.google.auth.OAuth2({
        clientId: process.env.YOUTUBE_CLIENT_ID,
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
        redirectUri: `${process.env.FRONTEND_URL}/integrations/social/youtube`,
    });
    const youtube = (newClient) => googleapis_1.google.youtube({
        version: 'v3',
        auth: newClient,
    });
    const youtubeAnalytics = (newClient) => googleapis_1.google.youtubeAnalytics({
        version: 'v2',
        auth: newClient,
    });
    const oauth2 = (newClient) => googleapis_1.google.oauth2({
        version: 'v2',
        auth: newClient,
    });
    return { client, youtube, oauth2, youtubeAnalytics };
};
let YoutubeProvider = class YoutubeProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 200;
        this.identifier = 'youtube';
        this.name = 'YouTube';
        this.isBetweenSteps = true;
        this.dto = youtube_settings_dto_1.YoutubeSettingsDto;
        this.scopes = [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtubepartner',
            'https://www.googleapis.com/auth/yt-analytics.readonly',
        ];
        this.editor = 'normal';
    }
    maxLength() {
        return 5000;
    }
    handleErrors(body) {
        if (body.includes('invalidTitle')) {
            return {
                type: 'bad-body',
                value: 'We have uploaded your video but we could not set the title. Title is too long.',
            };
        }
        if (body.includes('failedPrecondition')) {
            return {
                type: 'bad-body',
                value: 'We have uploaded your video but we could not set the thumbnail. Thumbnail size is too large.',
            };
        }
        if (body.includes('uploadLimitExceeded')) {
            return {
                type: 'bad-body',
                value: 'You have reached your daily upload limit, please try again tomorrow.',
            };
        }
        if (body.includes('youtubeSignupRequired')) {
            return {
                type: 'bad-body',
                value: 'You have to link your youtube account to your google account first.',
            };
        }
        if (body.includes('youtube.thumbnail')) {
            return {
                type: 'bad-body',
                value: 'Your account is not verified, we have uploaded your video but we could not set the thumbnail. Please verify your account and try again.',
            };
        }
        if (body.includes('Unauthorized')) {
            return {
                type: 'refresh-token',
                value: 'Token expired or invalid, please reconnect your YouTube account.',
            };
        }
        if (body.includes('UNAUTHENTICATED') || body.includes('invalid_grant')) {
            return {
                type: 'refresh-token',
                value: 'Please re-authenticate your YouTube account',
            };
        }
        return undefined;
    }
    async refreshToken(refresh_token) {
        const { client, oauth2 } = clientAndYoutube();
        client.setCredentials({ refresh_token });
        const { credentials } = await client.refreshAccessToken();
        const user = oauth2(client);
        const expiryDate = new Date(credentials.expiry_date);
        const unixTimestamp = Math.floor(expiryDate.getTime() / 1000) -
            Math.floor(new Date().getTime() / 1000);
        const { data } = await user.userinfo.get();
        return {
            accessToken: credentials.access_token,
            expiresIn: unixTimestamp,
            refreshToken: credentials.refresh_token ?? refresh_token,
            id: data.id,
            name: data.name,
            picture: data?.picture || '',
            username: '',
        };
    }
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(7);
        const { client } = clientAndYoutube();
        return {
            url: client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                state,
                redirect_uri: `${process.env.FRONTEND_URL}/integrations/social/youtube`,
                scope: this.scopes.slice(0),
            }),
            codeVerifier: (0, make_is_1.makeId)(11),
            state,
        };
    }
    async authenticate(params) {
        const { client, oauth2 } = clientAndYoutube();
        const { tokens } = await client.getToken(params.code);
        client.setCredentials(tokens);
        const { scopes } = await client.getTokenInfo(tokens.access_token);
        this.checkScopes(this.scopes, scopes);
        const user = oauth2(client);
        const { data } = await user.userinfo.get();
        const expiryDate = new Date(tokens.expiry_date);
        const unixTimestamp = Math.floor(expiryDate.getTime() / 1000) -
            Math.floor(new Date().getTime() / 1000);
        return {
            accessToken: tokens.access_token,
            expiresIn: unixTimestamp,
            refreshToken: tokens.refresh_token,
            id: data.id,
            name: data.name,
            picture: data?.picture || '',
            username: '',
        };
    }
    async pages(accessToken) {
        const { client, youtube } = clientAndYoutube();
        client.setCredentials({ access_token: accessToken });
        const youtubeClient = youtube(client);
        try {
            const response = await youtubeClient.channels.list({
                part: ['snippet', 'contentDetails', 'statistics'],
                mine: true,
            });
            const channels = response.data.items || [];
            return channels.map((channel) => ({
                id: channel.id,
                name: channel.snippet?.title || 'Unnamed Channel',
                picture: {
                    data: {
                        url: channel.snippet?.thumbnails?.default?.url || '',
                    },
                },
                username: channel.snippet?.customUrl || '',
                subscriberCount: channel.statistics?.subscriberCount || '0',
            }));
        }
        catch (error) {
            console.error('Failed to fetch YouTube channels:', error);
            return [];
        }
    }
    async fetchPageInformation(accessToken, data) {
        const { client, youtube } = clientAndYoutube();
        client.setCredentials({ access_token: accessToken });
        const youtubeClient = youtube(client);
        try {
            const response = await youtubeClient.channels.list({
                part: ['snippet', 'contentDetails', 'statistics'],
                id: [data.id],
            });
            const channel = response.data.items?.[0];
            if (!channel) {
                throw new Error('Channel not found');
            }
            return {
                id: channel.id,
                name: channel.snippet?.title || 'Unnamed Channel',
                access_token: accessToken,
                picture: channel.snippet?.thumbnails?.default?.url || '',
                username: channel.snippet?.customUrl || '',
            };
        }
        catch (error) {
            console.error('Failed to fetch YouTube channel information:', error);
            throw error;
        }
    }
    async reConnect(id, requiredId, accessToken) {
        const pages = await this.pages(accessToken);
        const findPage = pages.find((p) => p.id === requiredId);
        if (!findPage) {
            throw new Error('Channel not found');
        }
        const information = await this.fetchPageInformation(accessToken, {
            id: requiredId,
        });
        return {
            id: information.id,
            name: information.name,
            accessToken: information.access_token,
            picture: information.picture,
            username: information.username,
        };
    }
    async post(id, accessToken, postDetails) {
        const [firstPost, ...comments] = postDetails;
        const { client, youtube } = clientAndYoutube();
        client.setCredentials({ access_token: accessToken });
        const youtubeClient = youtube(client);
        const { settings } = firstPost;
        const response = await (0, axios_1.default)({
            url: firstPost?.media?.[0]?.path,
            method: 'GET',
            responseType: 'stream',
        });
        const all = await this.runInConcurrent(async () => youtubeClient.videos.insert({
            part: ['id', 'snippet', 'status'],
            notifySubscribers: true,
            requestBody: {
                snippet: {
                    title: settings.title,
                    description: firstPost?.message,
                    ...(settings?.tags?.length
                        ? { tags: settings.tags.map((p) => p.label) }
                        : {}),
                },
                status: {
                    privacyStatus: settings.type,
                    selfDeclaredMadeForKids: settings.selfDeclaredMadeForKids === 'yes',
                },
            },
            media: {
                body: response.data,
            },
        }), true);
        if (settings?.thumbnail?.path) {
            await this.runInConcurrent(async () => youtubeClient.thumbnails.set({
                videoId: all?.data?.id,
                media: {
                    body: (await (0, axios_1.default)({
                        url: settings?.thumbnail?.path,
                        method: 'GET',
                        responseType: 'stream',
                    })).data,
                },
            }));
        }
        return [
            {
                id: firstPost.id,
                releaseURL: `https://www.youtube.com/watch?v=${all?.data?.id}`,
                postId: all?.data?.id,
                status: 'success',
            },
        ];
    }
    async analytics(id, accessToken, date) {
        try {
            const endDate = (0, dayjs_1.default)().format('YYYY-MM-DD');
            const startDate = (0, dayjs_1.default)().subtract(date, 'day').format('YYYY-MM-DD');
            const { client, youtubeAnalytics } = clientAndYoutube();
            client.setCredentials({ access_token: accessToken });
            const youtubeClient = youtubeAnalytics(client);
            const { data } = await youtubeClient.reports.query({
                ids: 'channel==MINE',
                startDate,
                endDate,
                metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,likes,subscribersLost',
                dimensions: 'day',
                sort: 'day',
            });
            const columns = data?.columnHeaders?.map((p) => p.name);
            const mappedData = data?.rows?.map((p) => {
                return columns.reduce((acc, curr, index) => {
                    acc[curr] = p[index];
                    return acc;
                }, {});
            });
            const acc = [];
            acc.push({
                label: 'Estimated Minutes Watched',
                data: mappedData?.map((p) => ({
                    total: p.estimatedMinutesWatched,
                    date: p.day,
                })),
            });
            acc.push({
                label: 'Average View Duration',
                average: true,
                data: mappedData?.map((p) => ({
                    total: p.averageViewDuration,
                    date: p.day,
                })),
            });
            acc.push({
                label: 'Average View Percentage',
                average: true,
                data: mappedData?.map((p) => ({
                    total: p.averageViewPercentage,
                    date: p.day,
                })),
            });
            acc.push({
                label: 'Subscribers Gained',
                data: mappedData?.map((p) => ({
                    total: p.subscribersGained,
                    date: p.day,
                })),
            });
            acc.push({
                label: 'Subscribers Lost',
                data: mappedData?.map((p) => ({
                    total: p.subscribersLost,
                    date: p.day,
                })),
            });
            acc.push({
                label: 'Likes',
                data: mappedData?.map((p) => ({
                    total: p.likes,
                    date: p.day,
                })),
            });
            return acc;
        }
        catch (err) {
            return [];
        }
    }
    async postAnalytics(integrationId, accessToken, postId, date) {
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        try {
            const { client, youtube } = clientAndYoutube();
            client.setCredentials({ access_token: accessToken });
            const youtubeClient = youtube(client);
            const response = await youtubeClient.videos.list({
                part: ['statistics', 'snippet'],
                id: [postId],
            });
            const video = response.data.items?.[0];
            if (!video || !video.statistics) {
                return [];
            }
            const stats = video.statistics;
            const result = [];
            if (stats.viewCount !== undefined) {
                result.push({
                    label: 'Views',
                    percentageChange: 0,
                    data: [{ total: String(stats.viewCount), date: today }],
                });
            }
            if (stats.likeCount !== undefined) {
                result.push({
                    label: 'Likes',
                    percentageChange: 0,
                    data: [{ total: String(stats.likeCount), date: today }],
                });
            }
            if (stats.commentCount !== undefined) {
                result.push({
                    label: 'Comments',
                    percentageChange: 0,
                    data: [{ total: String(stats.commentCount), date: today }],
                });
            }
            if (stats.favoriteCount !== undefined) {
                result.push({
                    label: 'Favorites',
                    percentageChange: 0,
                    data: [{ total: String(stats.favoriteCount), date: today }],
                });
            }
            return result;
        }
        catch (err) {
            console.error('Error fetching YouTube post analytics:', err);
            return [];
        }
    }
};
exports.YoutubeProvider = YoutubeProvider;
exports.YoutubeProvider = YoutubeProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)('YouTube must have on video attachment, it cannot be empty')
], YoutubeProvider);
//# sourceMappingURL=youtube.provider.js.map