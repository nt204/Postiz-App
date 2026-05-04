"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmbProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const googleapis_1 = require("googleapis");
const social_abstract_1 = require("../social.abstract");
const process = tslib_1.__importStar(require("node:process"));
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
const gmb_settings_dto_1 = require("../../dtos/posts/providers-settings/gmb.settings.dto");
const clientAndGmb = () => {
    const client = new googleapis_1.google.auth.OAuth2({
        clientId: process.env.GOOGLE_GMB_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_GMB_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET,
        redirectUri: `${process.env.FRONTEND_URL}/integrations/social/gmb`,
    });
    const oauth2 = (newClient) => googleapis_1.google.oauth2({
        version: 'v2',
        auth: newClient,
    });
    return { client, oauth2 };
};
let GmbProvider = class GmbProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 3;
        this.identifier = 'gmb';
        this.name = 'Google My Business';
        this.isBetweenSteps = true;
        this.scopes = [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/business.manage',
        ];
        this.editor = 'normal';
        this.dto = gmb_settings_dto_1.GmbSettingsDto;
    }
    maxLength() {
        return 1500;
    }
    handleErrors(body) {
        if (body.includes('UNAUTHENTICATED') || body.includes('invalid_grant')) {
            return {
                type: 'refresh-token',
                value: 'Please re-authenticate your Google My Business account',
            };
        }
        if (body.includes('Unauthorized')) {
            return {
                type: 'refresh-token',
                value: 'Token expired or invalid, please reconnect your YouTube account.',
            };
        }
        if (body.includes('PERMISSION_DENIED')) {
            return {
                type: 'refresh-token',
                value: 'Permission denied. Please ensure you have access to this business location.',
            };
        }
        if (body.includes('NOT_FOUND')) {
            return {
                type: 'bad-body',
                value: 'Business location not found. It may have been deleted.',
            };
        }
        if (body.includes('INVALID_ARGUMENT')) {
            return {
                type: 'bad-body',
                value: 'Invalid post content. Please check your post details.',
            };
        }
        if (body.includes('RESOURCE_EXHAUSTED')) {
            return {
                type: 'bad-body',
                value: 'Rate limit exceeded. Please try again later.',
            };
        }
        return undefined;
    }
    async refreshToken(refresh_token) {
        const { client, oauth2 } = clientAndGmb();
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
            refreshToken: credentials.refresh_token || refresh_token,
            id: data.id,
            name: data.name,
            picture: data?.picture || '',
            username: '',
        };
    }
    async generateAuthUrl() {
        const state = (0, make_is_1.makeId)(7);
        const { client } = clientAndGmb();
        return {
            url: client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                state,
                redirect_uri: `${process.env.FRONTEND_URL}/integrations/social/gmb`,
                scope: this.scopes.slice(0),
            }),
            codeVerifier: (0, make_is_1.makeId)(11),
            state,
        };
    }
    async authenticate(params) {
        const { client, oauth2 } = clientAndGmb();
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
        const allAccounts = [];
        let accountsPageToken;
        do {
            const params = new URLSearchParams();
            if (accountsPageToken) {
                params.set('pageToken', accountsPageToken);
            }
            const url = `https://mybusinessaccountmanagement.googleapis.com/v1/accounts${params.toString() ? `?${params}` : ''}`;
            const accountsResponse = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const accountsData = await accountsResponse.json();
            if (accountsData.accounts) {
                allAccounts.push(...accountsData.accounts);
            }
            accountsPageToken = accountsData.nextPageToken;
        } while (accountsPageToken);
        if (allAccounts.length === 0) {
            return [];
        }
        const allLocations = [];
        for (const account of allAccounts) {
            const accountName = account.name;
            try {
                let locationsPageToken;
                do {
                    const params = new URLSearchParams({
                        readMask: 'name,title,storefrontAddress,metadata',
                    });
                    if (locationsPageToken) {
                        params.set('pageToken', locationsPageToken);
                    }
                    const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?${params}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    const locationsData = await locationsResponse.json();
                    if (locationsData.locations) {
                        for (const location of locationsData.locations) {
                            const locationId = location.name.replace('locations/', '');
                            const fullResourceName = `${accountName}/locations/${locationId}`;
                            let photoUrl = '';
                            try {
                                const mediaResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${location.name}/media`, {
                                    headers: {
                                        Authorization: `Bearer ${accessToken}`,
                                    },
                                });
                                const mediaData = await mediaResponse.json();
                                if (mediaData.mediaItems && mediaData.mediaItems.length > 0) {
                                    const profilePhoto = mediaData.mediaItems.find((m) => m.mediaFormat === 'PHOTO' &&
                                        m.locationAssociation?.category === 'PROFILE');
                                    if (profilePhoto?.googleUrl) {
                                        photoUrl = profilePhoto.googleUrl;
                                    }
                                    else if (mediaData.mediaItems[0]?.googleUrl) {
                                        photoUrl = mediaData.mediaItems[0].googleUrl;
                                    }
                                }
                            }
                            catch {
                            }
                            allLocations.push({
                                id: fullResourceName,
                                name: location.title || 'Unnamed Location',
                                picture: { data: { url: photoUrl } },
                                accountName: accountName,
                                locationName: location.name,
                            });
                        }
                    }
                    locationsPageToken = locationsData.nextPageToken;
                } while (locationsPageToken);
            }
            catch (error) {
                console.error(`Failed to fetch locations for account ${accountName}:`, error);
            }
        }
        return allLocations;
    }
    async fetchPageInformation(accessToken, data) {
        const locationResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${data.locationName}?readMask=name,title,storefrontAddress,metadata`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const locationData = await locationResponse.json();
        let photoUrl = '';
        try {
            const mediaResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${data.locationName}/media`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const mediaData = await mediaResponse.json();
            if (mediaData.mediaItems && mediaData.mediaItems.length > 0) {
                const profilePhoto = mediaData.mediaItems.find((m) => m.mediaFormat === 'PHOTO' &&
                    m.locationAssociation?.category === 'PROFILE');
                if (profilePhoto?.googleUrl) {
                    photoUrl = profilePhoto.googleUrl;
                }
                else if (mediaData.mediaItems[0]?.googleUrl) {
                    photoUrl = mediaData.mediaItems[0].googleUrl;
                }
            }
        }
        catch {
        }
        return {
            id: data.id,
            name: locationData.title || 'Unnamed Location',
            access_token: accessToken,
            picture: photoUrl,
            username: '',
        };
    }
    async reConnect(id, requiredId, accessToken) {
        const pages = await this.pages(accessToken);
        const findPage = pages.find((p) => p.id === requiredId);
        if (!findPage) {
            throw new Error('Location not found');
        }
        const information = await this.fetchPageInformation(accessToken, {
            id: requiredId,
            accountName: findPage.accountName,
            locationName: findPage.locationName,
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
        const [firstPost] = postDetails;
        const { settings } = firstPost;
        const postBody = {
            languageCode: 'en',
            summary: firstPost.message,
            topicType: settings?.topicType || 'STANDARD',
        };
        if (settings?.callToActionType &&
            settings.callToActionType !== 'NONE' &&
            settings?.callToActionUrl) {
            postBody.callToAction = {
                actionType: settings.callToActionType,
                url: settings.callToActionUrl,
            };
        }
        if (firstPost.media && firstPost.media.length > 0) {
            const mediaItem = firstPost.media[0];
            postBody.media = [
                {
                    mediaFormat: mediaItem.type === 'video' ? 'VIDEO' : 'PHOTO',
                    sourceUrl: mediaItem.path,
                },
            ];
        }
        if (settings?.topicType === 'EVENT' && settings?.eventTitle) {
            postBody.event = {
                title: settings.eventTitle,
                schedule: {
                    startDate: this.formatDate(settings.eventStartDate),
                    endDate: this.formatDate(settings.eventEndDate),
                    ...(settings.eventStartTime && {
                        startTime: this.formatTime(settings.eventStartTime),
                    }),
                    ...(settings.eventEndTime && {
                        endTime: this.formatTime(settings.eventEndTime),
                    }),
                },
            };
        }
        if (settings?.topicType === 'OFFER') {
            postBody.offer = {
                couponCode: settings?.offerCouponCode || undefined,
                redeemOnlineUrl: settings?.offerRedeemUrl || undefined,
                termsConditions: settings?.offerTerms || undefined,
            };
        }
        const response = await this.fetch(`https://mybusiness.googleapis.com/v4/${id}/localPosts`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postBody),
        }, 'create local post');
        const postData = await response.json();
        const postId = postData.name || '';
        const locationId = id.split('/').pop();
        const releaseURL = `https://business.google.com/locations/${locationId}`;
        return [
            {
                id: firstPost.id,
                postId: postId,
                releaseURL: releaseURL,
                status: 'success',
            },
        ];
    }
    formatDate(dateString) {
        if (!dateString) {
            return {
                year: (0, dayjs_1.default)().year(),
                month: (0, dayjs_1.default)().month() + 1,
                day: (0, dayjs_1.default)().date(),
            };
        }
        const date = (0, dayjs_1.default)(dateString);
        return {
            year: date.year(),
            month: date.month() + 1,
            day: date.date(),
        };
    }
    formatTime(timeString) {
        if (!timeString) {
            return undefined;
        }
        const [hours, minutes] = timeString.split(':').map(Number);
        return {
            hours: hours || 0,
            minutes: minutes || 0,
            seconds: 0,
            nanos: 0,
        };
    }
    async analytics(id, accessToken, date) {
        try {
            const endDate = (0, dayjs_1.default)().format('YYYY-MM-DD');
            const startDate = (0, dayjs_1.default)().subtract(date, 'day').format('YYYY-MM-DD');
            const locationId = id.split('/locations/')[1];
            const locationPath = `locations/${locationId}`;
            const response = await fetch(`https://businessprofileperformance.googleapis.com/v1/${locationPath}:fetchMultiDailyMetricsTimeSeries?dailyMetrics=WEBSITE_CLICKS&dailyMetrics=CALL_CLICKS&dailyMetrics=BUSINESS_DIRECTION_REQUESTS&dailyMetrics=BUSINESS_IMPRESSIONS_DESKTOP_MAPS&dailyMetrics=BUSINESS_IMPRESSIONS_MOBILE_MAPS&dailyRange.startDate.year=${(0, dayjs_1.default)(startDate).year()}&dailyRange.startDate.month=${(0, dayjs_1.default)(startDate).month() + 1}&dailyRange.startDate.day=${(0, dayjs_1.default)(startDate).date()}&dailyRange.endDate.year=${(0, dayjs_1.default)(endDate).year()}&dailyRange.endDate.month=${(0, dayjs_1.default)(endDate).month() + 1}&dailyRange.endDate.day=${(0, dayjs_1.default)(endDate).date()}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            const dailyMetricTimeSeries = data.multiDailyMetricTimeSeries?.[0]?.dailyMetricTimeSeries;
            if (!dailyMetricTimeSeries || dailyMetricTimeSeries.length === 0) {
                return [];
            }
            const metricLabels = {
                WEBSITE_CLICKS: 'Website Clicks',
                CALL_CLICKS: 'Phone Calls',
                BUSINESS_DIRECTION_REQUESTS: 'Direction Requests',
                BUSINESS_IMPRESSIONS_DESKTOP_MAPS: 'Desktop Map Views',
                BUSINESS_IMPRESSIONS_MOBILE_MAPS: 'Mobile Map Views',
            };
            const analytics = [];
            for (const series of dailyMetricTimeSeries) {
                const metricName = series.dailyMetric;
                const label = metricLabels[metricName] || metricName;
                const datedValues = series.timeSeries?.datedValues || [];
                const dataPoints = datedValues.map((dv) => ({
                    total: parseInt(dv.value || '0', 10),
                    date: `${dv.date.year}-${String(dv.date.month).padStart(2, '0')}-${String(dv.date.day).padStart(2, '0')}`,
                }));
                if (dataPoints.length > 0) {
                    analytics.push({
                        label,
                        percentageChange: 0,
                        data: dataPoints,
                    });
                }
            }
            return analytics;
        }
        catch (error) {
            console.error('Error fetching GMB analytics:', error);
            return [];
        }
    }
    async postAnalytics(integrationId, accessToken, postId, date) {
        return [];
    }
};
exports.GmbProvider = GmbProvider;
exports.GmbProvider = GmbProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)('Google My Business posts can have text content and optionally one image. Posts can be updates, events, or offers.')
], GmbProvider);
//# sourceMappingURL=gmb.provider.js.map