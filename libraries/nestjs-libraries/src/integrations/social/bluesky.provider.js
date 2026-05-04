"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlueskyProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const social_abstract_1 = require("../social.abstract");
const api_1 = require("@atproto/api");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const auth_service_1 = require("../../../../helpers/src/auth/auth.service");
const sharp_1 = tslib_1.__importDefault(require("sharp"));
const plug_decorator_1 = require("../../../../helpers/src/decorators/plug.decorator");
const timer_1 = require("../../../../helpers/src/utils/timer");
const axios_1 = tslib_1.__importDefault(require("axios"));
const strip_html_validation_1 = require("../../../../helpers/src/utils/strip.html.validation");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
async function reduceImageBySize(url, maxSizeKB = 976) {
    try {
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        let imageBuffer = Buffer.from(response.data);
        const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
        let width = metadata.width;
        let height = metadata.height;
        while (imageBuffer.length / 1024 > maxSizeKB) {
            width = Math.floor(width * 0.9);
            height = Math.floor(height * 0.9);
            const resizedBuffer = await (0, sharp_1.default)(imageBuffer)
                .resize({ width, height })
                .toBuffer();
            imageBuffer = resizedBuffer;
            if (width < 10 || height < 10)
                break;
        }
        return { width, height, buffer: imageBuffer };
    }
    catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}
async function uploadVideo(agent, videoPath) {
    const { data: serviceAuth } = await agent.com.atproto.server.getServiceAuth({
        aud: `did:web:${agent.dispatchUrl.host}`,
        lxm: 'com.atproto.repo.uploadBlob',
        exp: Date.now() / 1000 + 60 * 30,
    });
    async function downloadVideo(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const video = Buffer.from(arrayBuffer);
        const size = video.length;
        return { video, size };
    }
    const video = await downloadVideo(videoPath);
    console.log('Downloaded video', videoPath, video.size);
    const uploadUrl = new URL('https://video.bsky.app/xrpc/app.bsky.video.uploadVideo');
    uploadUrl.searchParams.append('did', agent.session.did);
    uploadUrl.searchParams.append('name', videoPath.split('/').pop());
    const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${serviceAuth.token}`,
            'Content-Type': 'video/mp4',
            'Content-Length': video.size.toString(),
        },
        body: video.video,
    });
    const jobStatus = (await uploadResponse.json());
    console.log('JobId:', jobStatus.jobId);
    let blob = jobStatus.blob;
    const videoAgent = new api_1.AtpAgent({ service: 'https://video.bsky.app' });
    while (!blob) {
        const { data: status } = await videoAgent.app.bsky.video.getJobStatus({
            jobId: jobStatus.jobId,
        });
        console.log('Status:', status.jobStatus.state, status.jobStatus.progress || '');
        if (status.jobStatus.blob) {
            blob = status.jobStatus.blob;
        }
        if (status.jobStatus.state === 'JOB_STATE_FAILED') {
            throw new social_abstract_1.BadBody('bluesky', JSON.stringify({}), {}, 'Could not upload video, job failed');
        }
        await (0, timer_1.timer)(30000);
    }
    console.log('posting video...');
    return {
        $type: 'app.bsky.embed.video',
        video: blob,
    };
}
let BlueskyProvider = class BlueskyProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 2;
        this.identifier = 'bluesky';
        this.name = 'Bluesky';
        this.toolTip = "We don’t currently support two-factor authentication. If it’s enabled on Bluesky, you’ll need to disable it.";
        this.isBetweenSteps = false;
        this.scopes = ['write:statuses', 'profile', 'write:media'];
        this.editor = 'normal';
    }
    maxLength() {
        return 300;
    }
    async customFields() {
        return [
            {
                key: 'service',
                label: 'Service',
                defaultValue: 'https://bsky.social',
                validation: `/^(https?:\\/\\/)?((([a-zA-Z0-9\\-_]{1,256}\\.[a-zA-Z]{2,6})|(([0-9]{1,3}\\.){3}[0-9]{1,3}))(:[0-9]{1,5})?)(\\/[^\\s]*)?$/`,
                type: 'text',
            },
            {
                key: 'identifier',
                label: 'Identifier',
                validation: `/^.+$/`,
                type: 'text',
            },
            {
                key: 'password',
                label: 'Password',
                validation: `/^.{3,}$/`,
                type: 'password',
            },
        ];
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
    async authenticate(params) {
        const body = JSON.parse(Buffer.from(params.code, 'base64').toString());
        try {
            const agent = new api_1.BskyAgent({
                service: body.service,
            });
            const { data: { accessJwt, refreshJwt, handle, did }, } = await agent.login({
                identifier: body.identifier,
                password: body.password,
            });
            const profile = await agent.getProfile({
                actor: did,
            });
            return {
                refreshToken: refreshJwt,
                expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
                accessToken: accessJwt,
                id: did,
                name: profile.data.displayName,
                picture: profile?.data?.avatar || '',
                username: profile.data.handle,
            };
        }
        catch (e) {
            console.log(e);
            return 'Invalid credentials';
        }
    }
    async getAgent(integration) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const agent = new api_1.BskyAgent({
            service: body.service,
        });
        try {
            await agent.login({
                identifier: body.identifier,
                password: body.password,
            });
        }
        catch (err) {
            throw new social_abstract_1.RefreshToken('bluesky', JSON.stringify(err), {});
        }
        return agent;
    }
    async uploadMediaForPost(agent, post) {
        const imageMedia = post.media?.filter((p) => p.path.indexOf('mp4') === -1) || [];
        const videoMedia = post.media?.filter((p) => p.path.indexOf('mp4') !== -1) || [];
        const images = await Promise.all(imageMedia.map(async (p) => {
            const { buffer, width, height } = await reduceImageBySize(p.path);
            return {
                width,
                height,
                buffer: await agent.uploadBlob(new Blob([buffer])),
            };
        }));
        let videoEmbed = null;
        if (videoMedia.length > 0) {
            videoEmbed = await uploadVideo(agent, videoMedia[0].path);
        }
        let embed = {};
        if (videoEmbed) {
            embed = videoEmbed;
        }
        else if (images.length > 0) {
            embed = {
                $type: 'app.bsky.embed.images',
                images: images.map((p, index) => ({
                    alt: imageMedia?.[index]?.alt || '',
                    image: p.buffer.data.blob,
                    aspectRatio: {
                        width: p.width,
                        height: p.height,
                    },
                })),
            };
        }
        return { embed, images };
    }
    async post(id, accessToken, postDetails, integration) {
        const agent = await this.getAgent(integration);
        const [firstPost] = postDetails;
        const { embed } = await this.uploadMediaForPost(agent, firstPost);
        const rt = new api_1.RichText({
            text: firstPost.message,
        });
        await rt.detectFacets(agent);
        const { cid, uri, commit } = await agent.post({
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            ...(Object.keys(embed).length > 0 ? { embed } : {}),
        });
        return [
            {
                id: firstPost.id,
                postId: uri,
                status: 'completed',
                releaseURL: `https://bsky.app/profile/${id}/post/${uri.split('/').pop()}`,
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const agent = await this.getAgent(integration);
        const [commentPost] = postDetails;
        const { embed } = await this.uploadMediaForPost(agent, commentPost);
        const rt = new api_1.RichText({
            text: commentPost.message,
        });
        await rt.detectFacets(agent);
        const parentUri = lastCommentId || postId;
        const parentThread = await agent.getPostThread({
            uri: parentUri,
            depth: 0,
        });
        const parentCid = parentThread.data.thread.post?.cid;
        const rootUri = parentThread.data.thread.post?.record?.reply?.root?.uri || postId;
        const rootCid = parentThread.data.thread.post?.record?.reply?.root?.cid || parentCid;
        const { cid, uri, commit } = await agent.post({
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            ...(Object.keys(embed).length > 0 ? { embed } : {}),
            reply: {
                root: {
                    uri: rootUri,
                    cid: rootCid,
                },
                parent: {
                    uri: parentUri,
                    cid: parentCid,
                },
            },
        });
        return [
            {
                id: commentPost.id,
                postId: uri,
                status: 'completed',
                releaseURL: `https://bsky.app/profile/${id}/post/${uri.split('/').pop()}`,
            },
        ];
    }
    async autoRepostPost(integration, id, fields) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const agent = new api_1.BskyAgent({
            service: body.service,
        });
        await agent.login({
            identifier: body.identifier,
            password: body.password,
        });
        const getThread = await agent.getPostThread({
            uri: id,
            depth: 0,
        });
        if (getThread.data.thread.post?.likeCount >= +fields.likesAmount) {
            await (0, timer_1.timer)(2000);
            await agent.repost(getThread.data.thread.post?.uri, getThread.data.thread.post?.cid);
            return true;
        }
        return true;
    }
    async autoPlugPost(integration, id, fields) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const agent = new api_1.BskyAgent({
            service: body.service,
        });
        await agent.login({
            identifier: body.identifier,
            password: body.password,
        });
        const getThread = await agent.getPostThread({
            uri: id,
            depth: 0,
        });
        if (getThread.data.thread.post?.likeCount >= +fields.likesAmount) {
            await (0, timer_1.timer)(2000);
            const rt = new api_1.RichText({
                text: (0, strip_html_validation_1.stripHtmlValidation)('normal', fields.post, true),
            });
            await agent.post({
                text: rt.text,
                facets: rt.facets,
                createdAt: new Date().toISOString(),
                reply: {
                    root: {
                        uri: getThread.data.thread.post?.uri,
                        cid: getThread.data.thread.post?.cid,
                    },
                    parent: {
                        uri: getThread.data.thread.post?.uri,
                        cid: getThread.data.thread.post?.cid,
                    },
                },
            });
            return true;
        }
        return true;
    }
    async mention(token, d, id, integration) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const agent = new api_1.BskyAgent({
            service: body.service,
        });
        await agent.login({
            identifier: body.identifier,
            password: body.password,
        });
        const list = await agent.searchActors({
            q: d.query,
        });
        return list.data.actors.map((p) => ({
            label: p.displayName,
            id: p.handle,
            image: p.avatar,
        }));
    }
    mentionFormat(idOrHandle, name) {
        return `@${idOrHandle}`;
    }
};
exports.BlueskyProvider = BlueskyProvider;
tslib_1.__decorate([
    (0, plug_decorator_1.Plug)({
        identifier: 'bluesky-autoRepostPost',
        title: 'Auto Repost Posts',
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
], BlueskyProvider.prototype, "autoRepostPost", null);
tslib_1.__decorate([
    (0, plug_decorator_1.Plug)({
        identifier: 'bluesky-autoPlugPost',
        title: 'Auto plug post',
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
], BlueskyProvider.prototype, "autoPlugPost", null);
exports.BlueskyProvider = BlueskyProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)('Bluesky can have maximum 1 video or 4 pictures in one post, it can also be without attachments')
], BlueskyProvider);
//# sourceMappingURL=bluesky.provider.js.map