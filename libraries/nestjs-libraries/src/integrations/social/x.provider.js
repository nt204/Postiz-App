"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XProvider = void 0;
const tslib_1 = require("tslib");
const twitter_api_v2_1 = require("twitter-api-v2");
const crypto_1 = require("crypto");
const mime_types_1 = require("mime-types");
const sharp_1 = tslib_1.__importDefault(require("sharp"));
const read_or_fetch_1 = require("../../../../helpers/src/utils/read.or.fetch");
const social_abstract_1 = require("../social.abstract");
const plug_decorator_1 = require("../../../../helpers/src/decorators/plug.decorator");
const timer_1 = require("../../../../helpers/src/utils/timer");
const post_plug_1 = require("../../../../helpers/src/decorators/post.plug");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const lodash_1 = require("lodash");
const strip_html_validation_1 = require("../../../../helpers/src/utils/strip.html.validation");
const x_dto_1 = require("../../dtos/posts/providers-settings/x.dto");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
let XProvider = class XProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'x';
        this.name = 'X';
        this.isBetweenSteps = false;
        this.scopes = [];
        this.maxConcurrentJob = 1;
        this.toolTip = 'You will be logged in into your current account, if you would like a different account, change it first on X';
        this.editor = 'normal';
        this.dto = x_dto_1.XDto;
        this.loadAllTweets = async (client, id, until, since, token = '') => {
            const tweets = await client.v2.userTimeline(id, {
                'tweet.fields': ['id'],
                'user.fields': [],
                'poll.fields': [],
                'place.fields': [],
                'media.fields': [],
                exclude: ['replies', 'retweets'],
                start_time: since,
                end_time: until,
                max_results: 100,
                ...(token ? { pagination_token: token } : {}),
            });
            return [
                ...tweets.data.data,
                ...(tweets.data.data.length === 100
                    ? await this.loadAllTweets(client, id, until, since, tweets.meta.next_token)
                    : []),
            ];
        };
    }
    maxLength(isTwitterPremium) {
        return isTwitterPremium ? 4000 : 200;
    }
    handleErrors(body) {
        if (body.includes('You are not permitted to perform this action')) {
            return {
                type: 'bad-body',
                value: 'There is a problem posting, please edit your post and check character count and media attachments',
            };
        }
        if (body.includes('maximum of one cashtag')) {
            return {
                type: 'bad-body',
                value: 'There can be maximum of one cashtag ($SYMBOL) per post',
            };
        }
        if (body.includes('maximum of 4 items')) {
            return {
                type: 'bad-body',
                value: 'There must be a maximum of 4 items per post',
            };
        }
        if (body.includes('Unsupported Authentication')) {
            return {
                type: 'refresh-token',
                value: 'X authentication has expired, please reconnect your account',
            };
        }
        if (body.includes('usage-capped')) {
            return {
                type: 'bad-body',
                value: 'Posting failed - capped reached. Please try again later',
            };
        }
        if (body.includes('duplicate-rules')) {
            return {
                type: 'bad-body',
                value: 'You have already posted this post, please wait before posting again',
            };
        }
        if (body.includes('The Tweet contains an invalid URL.')) {
            return {
                type: 'bad-body',
                value: 'The Tweet contains a URL that is not allowed on X',
            };
        }
        if (body.includes('This user is not allowed to post a video longer than 2 minutes')) {
            return {
                type: 'bad-body',
                value: 'The video you are trying to post is longer than 2 minutes, which is not allowed for this account',
            };
        }
        return undefined;
    }
    async autoRepostPost(integration, id, fields) {
        const [accessTokenSplit, accessSecretSplit] = integration.token.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        if ((await client.v2.tweetLikedBy(id)).meta.result_count >=
            +fields.likesAmount) {
            await (0, timer_1.timer)(2000);
            await client.v2.retweet(integration.internalId, id);
            return true;
        }
        return false;
    }
    async repostPostUsers(integration, originalIntegration, postId, information) {
        const [accessTokenSplit, accessSecretSplit] = integration.token.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        const { data: { id }, } = await client.v2.me();
        try {
            await client.v2.retweet(id, postId);
        }
        catch (err) {
        }
    }
    async autoPlugPost(integration, id, fields) {
        const [accessTokenSplit, accessSecretSplit] = integration.token.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        if ((await client.v2.tweetLikedBy(id)).meta.result_count >=
            +fields.likesAmount) {
            await (0, timer_1.timer)(2000);
            await client.v2.tweet({
                text: (0, strip_html_validation_1.stripHtmlValidation)('normal', fields.post, true),
                reply: { in_reply_to_tweet_id: id },
            });
            return true;
        }
        return false;
    }
    async refreshToken() {
        return {
            id: '',
            name: '',
            accessToken: '',
            refreshToken: '',
            expiresIn: 0,
            picture: '',
            username: '',
        };
    }
    async generateAuthUrl() {
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
        });
        const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink((process.env.X_URL || process.env.FRONTEND_URL) +
            `/integrations/social/x`, {
            authAccessType: 'write',
            linkMode: 'authenticate',
            forceLogin: false,
        });
        return {
            url,
            codeVerifier: oauth_token + ':' + oauth_token_secret,
            state: oauth_token,
        };
    }
    async authenticate(params) {
        const { code, codeVerifier } = params;
        const [oauth_token, oauth_token_secret] = codeVerifier.split(':');
        const startingClient = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: oauth_token,
            accessSecret: oauth_token_secret,
        });
        const { accessToken, client, accessSecret } = await startingClient.login(code);
        const { data: { username, verified, profile_image_url, name, id }, } = await client.v2.me({
            'user.fields': [
                'username',
                'verified',
                'verified_type',
                'profile_image_url',
                'name',
            ],
        });
        return {
            id: String(id),
            accessToken: accessToken + ':' + accessSecret,
            name,
            refreshToken: '',
            expiresIn: 999999999,
            picture: profile_image_url || '',
            username,
            additionalSettings: [
                {
                    title: 'Verified',
                    description: 'Is this a verified user? (Premium)',
                    type: 'checkbox',
                    value: verified,
                },
            ],
        };
    }
    async getClient(accessToken) {
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        return new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
    }
    signOAuth1(method, url, accessToken, accessSecret) {
        const pct = (s) => encodeURIComponent(s)
            .replace(/!/g, '%21')
            .replace(/\*/g, '%2A')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');
        const params = {
            oauth_consumer_key: process.env.X_API_KEY,
            oauth_nonce: (0, crypto_1.randomBytes)(16).toString('hex'),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: String(Math.floor(Date.now() / 1000)),
            oauth_token: accessToken,
            oauth_version: '1.0',
        };
        const paramString = Object.keys(params)
            .sort()
            .map((k) => `${pct(k)}=${pct(params[k])}`)
            .join('&');
        const baseString = [
            method.toUpperCase(),
            pct(url.split('?')[0]),
            pct(paramString),
        ].join('&');
        const signingKey = `${pct(process.env.X_API_SECRET)}&${pct(accessSecret)}`;
        params.oauth_signature = (0, crypto_1.createHmac)('sha1', signingKey)
            .update(baseString)
            .digest('base64');
        return ('OAuth ' +
            Object.keys(params)
                .sort()
                .map((k) => `${pct(k)}="${pct(params[k])}"`)
                .join(', '));
    }
    async uploadMedia(client, postDetails) {
        return (await Promise.all(postDetails.flatMap((p) => p?.media?.flatMap(async (m) => {
            return {
                id: await this.runInConcurrent(async () => client.v2.uploadMedia(m.path.indexOf('mp4') > -1
                    ? Buffer.from(await (0, read_or_fetch_1.readOrFetch)(m.path))
                    : await (0, sharp_1.default)(await (0, read_or_fetch_1.readOrFetch)(m.path), {
                        animated: (0, mime_types_1.lookup)(m.path) === 'image/gif',
                    })
                        .resize({
                        width: 1000,
                    })
                        .gif()
                        .toBuffer(), {
                    media_type: ((0, mime_types_1.lookup)(m.path) || ''),
                }), true),
                postId: p.id,
            };
        })))).reduce((acc, val) => {
            if (!val?.id) {
                return acc;
            }
            acc[val.postId] = acc[val.postId] || [];
            acc[val.postId].push(val.id);
            return acc;
        }, {});
    }
    async post(id, accessToken, postDetails) {
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        const client = await this.getClient(accessToken);
        const { data: { username }, } = await this.runInConcurrent(async () => client.v2.me({
            'user.fields': 'username',
        }));
        const [firstPost] = postDetails;
        const uploadAll = await this.uploadMedia(client, [firstPost]);
        const media_ids = (uploadAll[firstPost.id] || []).filter((f) => f);
        const tweetUrl = 'https://api.x.com/2/tweets';
        const tweetBody = {
            ...(!firstPost?.settings?.who_can_reply_post ||
                firstPost?.settings?.who_can_reply_post === 'everyone'
                ? {}
                : {
                    reply_settings: firstPost?.settings?.who_can_reply_post,
                }),
            ...(firstPost?.settings?.community
                ? {
                    share_with_followers: true,
                    community_id: firstPost?.settings?.community?.split('/').pop() || '',
                }
                : {}),
            text: firstPost.message,
            ...(media_ids.length ? { media: { media_ids } } : {}),
            made_with_ai: !!firstPost?.settings?.made_with_ai,
            paid_partnership: !!firstPost?.settings?.paid_partnership,
        };
        const tweetResponse = await this.fetch(tweetUrl, {
            method: 'POST',
            headers: {
                Authorization: this.signOAuth1('POST', tweetUrl, accessTokenSplit, accessSecretSplit),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tweetBody),
        });
        const { data } = (await tweetResponse.json());
        return [
            {
                postId: data.id,
                id: firstPost.id,
                releaseURL: `https://twitter.com/${username}/status/${data.id}`,
                status: 'posted',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        const client = await this.getClient(accessToken);
        const { data: { username }, } = await this.runInConcurrent(async () => client.v2.me({
            'user.fields': 'username',
        }));
        const [commentPost] = postDetails;
        const uploadAll = await this.uploadMedia(client, [commentPost]);
        const media_ids = (uploadAll[commentPost.id] || []).filter((f) => f);
        const replyToId = lastCommentId || postId;
        const tweetUrl = 'https://api.x.com/2/tweets';
        const tweetBody = {
            text: commentPost.message,
            ...(media_ids.length ? { media: { media_ids } } : {}),
            reply: { in_reply_to_tweet_id: replyToId },
            made_with_ai: !!commentPost?.settings?.made_with_ai,
            paid_partnership: !!commentPost?.settings?.paid_partnership,
        };
        const tweetResponse = await this.fetch(tweetUrl, {
            method: 'POST',
            headers: {
                Authorization: this.signOAuth1('POST', tweetUrl, accessTokenSplit, accessSecretSplit),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tweetBody),
        });
        const { data } = (await tweetResponse.json());
        return [
            {
                postId: data.id,
                id: commentPost.id,
                releaseURL: `https://twitter.com/${username}/status/${data.id}`,
                status: 'posted',
            },
        ];
    }
    async analytics(id, accessToken, date) {
        if (process.env.DISABLE_X_ANALYTICS) {
            return [];
        }
        const until = (0, dayjs_1.default)().endOf('day');
        const since = (0, dayjs_1.default)().subtract(date > 100 ? 100 : date, 'day');
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        try {
            const tweets = (0, lodash_1.uniqBy)(await this.loadAllTweets(client, id, until.format('YYYY-MM-DDTHH:mm:ssZ'), since.format('YYYY-MM-DDTHH:mm:ssZ')), (p) => p.id);
            if (tweets.length === 0) {
                return [];
            }
            const data = await client.v2.tweets(tweets.map((p) => p.id), {
                'tweet.fields': ['public_metrics'],
            });
            const metrics = data.data.reduce((all, current) => {
                all.impression_count =
                    (all.impression_count || 0) +
                        +current.public_metrics.impression_count;
                all.bookmark_count =
                    (all.bookmark_count || 0) + +current.public_metrics.bookmark_count;
                all.like_count =
                    (all.like_count || 0) + +current.public_metrics.like_count;
                all.quote_count =
                    (all.quote_count || 0) + +current.public_metrics.quote_count;
                all.reply_count =
                    (all.reply_count || 0) + +current.public_metrics.reply_count;
                all.retweet_count =
                    (all.retweet_count || 0) + +current.public_metrics.retweet_count;
                return all;
            }, {
                impression_count: 0,
                bookmark_count: 0,
                like_count: 0,
                quote_count: 0,
                reply_count: 0,
                retweet_count: 0,
            });
            return Object.entries(metrics).map(([key, value]) => ({
                label: key.replace('_count', '').replace('_', ' ').toUpperCase(),
                percentageChange: 5,
                data: [
                    {
                        total: String(0),
                        date: since.format('YYYY-MM-DD'),
                    },
                    {
                        total: String(value),
                        date: until.format('YYYY-MM-DD'),
                    },
                ],
            }));
        }
        catch (err) {
            console.log(err);
        }
        return [];
    }
    async postAnalytics(integrationId, accessToken, postId, date) {
        if (process.env.DISABLE_X_ANALYTICS) {
            return [];
        }
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        try {
            const tweet = await client.v2.singleTweet(postId, {
                'tweet.fields': ['public_metrics', 'created_at'],
            });
            if (!tweet?.data?.public_metrics) {
                return [];
            }
            const metrics = tweet.data.public_metrics;
            const result = [];
            if (metrics.impression_count !== undefined) {
                result.push({
                    label: 'Impressions',
                    percentageChange: 0,
                    data: [{ total: String(metrics.impression_count), date: today }],
                });
            }
            if (metrics.like_count !== undefined) {
                result.push({
                    label: 'Likes',
                    percentageChange: 0,
                    data: [{ total: String(metrics.like_count), date: today }],
                });
            }
            if (metrics.retweet_count !== undefined) {
                result.push({
                    label: 'Retweets',
                    percentageChange: 0,
                    data: [{ total: String(metrics.retweet_count), date: today }],
                });
            }
            if (metrics.reply_count !== undefined) {
                result.push({
                    label: 'Replies',
                    percentageChange: 0,
                    data: [{ total: String(metrics.reply_count), date: today }],
                });
            }
            if (metrics.quote_count !== undefined) {
                result.push({
                    label: 'Quotes',
                    percentageChange: 0,
                    data: [{ total: String(metrics.quote_count), date: today }],
                });
            }
            if (metrics.bookmark_count !== undefined) {
                result.push({
                    label: 'Bookmarks',
                    percentageChange: 0,
                    data: [{ total: String(metrics.bookmark_count), date: today }],
                });
            }
            return result;
        }
        catch (err) {
            console.log('Error fetching X post analytics:', err);
        }
        return [];
    }
    async mention(token, d) {
        const [accessTokenSplit, accessSecretSplit] = token.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        try {
            const data = await client.v2.userByUsername(d.query, {
                'user.fields': ['username', 'name', 'profile_image_url'],
            });
            if (!data?.data?.username) {
                return [];
            }
            return [
                {
                    id: data.data.username,
                    image: data.data.profile_image_url,
                    label: data.data.name,
                },
            ];
        }
        catch (err) {
            console.log(err);
        }
        return [];
    }
    mentionFormat(idOrHandle, name) {
        return `@${idOrHandle}`;
    }
};
exports.XProvider = XProvider;
tslib_1.__decorate([
    (0, plug_decorator_1.Plug)({
        identifier: 'x-autoRepostPost',
        title: 'Auto Repost Posts',
        disabled: !!process.env.DISABLE_X_ANALYTICS,
        description: 'When a post reached a certain number of likes, repost it to increase engagement (1 week old posts)',
        runEveryMilliseconds: 21600000,
        totalRuns: 3,
        fields: [
            {
                name: 'likesAmount',
                type: 'number',
                placeholder: 'Amount of likes',
                description: 'The amount of likes to trigger the repost',
                validation: /^\d+$/,
            },
        ],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XProvider.prototype, "autoRepostPost", null);
tslib_1.__decorate([
    (0, post_plug_1.PostPlug)({
        identifier: 'x-repost-post-users',
        title: 'Add Re-posters',
        description: 'Add accounts to repost your post',
        pickIntegration: ['x'],
        fields: [],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XProvider.prototype, "repostPostUsers", null);
tslib_1.__decorate([
    (0, plug_decorator_1.Plug)({
        identifier: 'x-autoPlugPost',
        title: 'Auto plug post',
        disabled: !!process.env.DISABLE_X_ANALYTICS,
        description: 'When a post reached a certain number of likes, add another post to it so you followers get a notification about your promotion',
        runEveryMilliseconds: 21600000,
        totalRuns: 3,
        fields: [
            {
                name: 'likesAmount',
                type: 'number',
                placeholder: 'Amount of likes',
                description: 'The amount of likes to trigger the repost',
                validation: /^\d+$/,
            },
            {
                name: 'post',
                type: 'richtext',
                placeholder: 'Post to plug',
                description: 'Message content to plug',
                validation: /^[\s\S]{3,}$/g,
            },
        ],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XProvider.prototype, "autoPlugPost", null);
exports.XProvider = XProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)('X can have maximum 4 pictures, or maximum one video, it can also be without attachments')
], XProvider);
//# sourceMappingURL=x.provider.js.map