"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramProvider = void 0;
const tslib_1 = require("tslib");
const make_is_1 = require("../../services/make.is");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const social_abstract_1 = require("../social.abstract");
const mime_1 = tslib_1.__importDefault(require("mime"));
const node_telegram_bot_api_1 = tslib_1.__importDefault(require("node-telegram-bot-api"));
const striptags_1 = tslib_1.__importDefault(require("striptags"));
const telegramBot = new node_telegram_bot_api_1.default(process.env.TELEGRAM_TOKEN);
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5000';
const mediaStorage = process.env.STORAGE_PROVIDER || 'local';
class TelegramProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 3;
        this.identifier = 'telegram';
        this.name = 'Telegram';
        this.isBetweenSteps = false;
        this.isWeb3 = true;
        this.scopes = [];
        this.editor = 'html';
    }
    maxLength() {
        return 4096;
    }
    async refreshToken(refresh_token) {
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
        const state = (0, make_is_1.makeId)(17);
        return {
            url: state,
            codeVerifier: (0, make_is_1.makeId)(10),
            state,
        };
    }
    async authenticate(params) {
        const chat = await telegramBot.getChat(params.code);
        console.log(JSON.stringify(chat));
        if (!chat?.id) {
            return 'No chat found';
        }
        const photo = !chat?.photo?.big_file_id
            ? ''
            : await telegramBot.getFileLink(chat.photo.big_file_id);
        return {
            id: String(chat.username ? chat.username : chat.id),
            name: chat.title,
            accessToken: String(chat.id),
            refreshToken: '',
            expiresIn: (0, dayjs_1.default)().add(200, 'year').unix() - (0, dayjs_1.default)().unix(),
            picture: photo || '',
            username: chat.username,
        };
    }
    async getBotId(query) {
        const res = await telegramBot.getUpdates({
            ...(query.id ? { offset: query.id } : {}),
            allowed_updates: ['message', 'channel_post'],
        });
        const match = res.find((p) => (p?.message?.text === `/connect ${query.word}` &&
            p?.message?.chat?.id) ||
            (p?.channel_post?.text === `/connect ${query.word}` &&
                p?.channel_post?.chat?.id));
        const chatId = match?.message?.chat?.id || match?.channel_post?.chat?.id;
        if (chatId) {
            const botId = (await telegramBot.getMe()).id;
            const isAdmin = await this.botIsAdmin(chatId, botId);
            const connectMessageId = match?.message?.message_id || match?.channel_post?.message_id;
            if (!isAdmin) {
                telegramBot.sendMessage(chatId, "Connection Successful. I don't have admin privileges to delete these messages, please go ahead and remove them yourself.");
            }
            else {
                await telegramBot.deleteMessage(chatId, connectMessageId);
                const successMessage = await telegramBot.sendMessage(chatId, 'Connection Successful. Message will be deleted in 10 seconds.');
                setTimeout(async () => {
                    await telegramBot.deleteMessage(chatId, successMessage.message_id);
                    console.log('Success message deleted.');
                }, 10000);
            }
        }
        return chatId
            ? { chatId }
            : res.length > 0
                ? {
                    lastChatId: res[res.length - 1].update_id + 1,
                }
                : {};
    }
    processMedia(mediaFiles) {
        return (mediaFiles || []).map((media) => {
            let mediaUrl = media.path;
            if (mediaStorage === 'local' && mediaUrl.startsWith(frontendURL)) {
                mediaUrl = mediaUrl.replace(frontendURL, '');
            }
            const mimeType = mime_1.default.getType(mediaUrl);
            let mediaType;
            if (mimeType?.startsWith('image/')) {
                mediaType = 'photo';
            }
            else if (mimeType?.startsWith('video/')) {
                mediaType = 'video';
            }
            else {
                mediaType = 'document';
            }
            return {
                type: mediaType,
                media: mediaUrl,
                fileOptions: {
                    filename: media.path.split('/').pop(),
                    contentType: mimeType || 'application/octet-stream',
                },
            };
        });
    }
    async sendMessage(accessToken, message, replyToMessageId) {
        let messageId = null;
        const mediaFiles = message.media || [];
        const text = (0, striptags_1.default)(message.message || '', ['u', 'strong', 'p'])
            .replace(/<strong>/g, '<b>')
            .replace(/<\/strong>/g, '</b>')
            .replace(/<p>(.*?)<\/p>/g, '$1\n');
        console.log(text);
        const processedMedia = this.processMedia(mediaFiles);
        if (processedMedia.length === 0) {
            const response = await telegramBot.sendMessage(accessToken, text, {
                parse_mode: 'HTML',
                ...(replyToMessageId ? { reply_to_message_id: replyToMessageId } : {}),
            });
            messageId = response.message_id;
        }
        else if (processedMedia.length === 1) {
            const media = processedMedia[0];
            const options = {
                caption: text,
                parse_mode: 'HTML',
                ...(replyToMessageId ? { reply_to_message_id: replyToMessageId } : {}),
            };
            const response = media.type === 'video'
                ? await telegramBot.sendVideo(accessToken, media.media, options, media.fileOptions)
                : media.type === 'photo'
                    ? await telegramBot.sendPhoto(accessToken, media.media, options, media.fileOptions)
                    : await telegramBot.sendDocument(accessToken, media.media, options, media.fileOptions);
            messageId = response.message_id;
        }
        else {
            const mediaGroups = this.chunkMedia(processedMedia, 10);
            for (let i = 0; i < mediaGroups.length; i++) {
                const mediaGroup = mediaGroups[i].map((m, index) => ({
                    type: m.type === 'document' ? 'document' : m.type,
                    media: m.media,
                    caption: i === 0 && index === 0 ? text : undefined,
                    parse_mode: 'HTML',
                }));
                const response = await telegramBot.sendMediaGroup(accessToken, mediaGroup, {
                    ...(replyToMessageId && i === 0
                        ? { reply_to_message_id: replyToMessageId }
                        : {}),
                });
                if (i === 0) {
                    messageId = response[0].message_id;
                }
            }
        }
        return messageId;
    }
    async post(id, accessToken, postDetails) {
        const [firstPost] = postDetails;
        const messageId = await this.sendMessage(accessToken, firstPost);
        if (messageId) {
            return [
                {
                    id: firstPost.id,
                    postId: String(messageId),
                    releaseURL: `https://t.me/${id !== 'undefined' ? id : `c/${accessToken.replace('-100', '')}`}/${messageId}`,
                    status: 'completed',
                },
            ];
        }
        return [];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const replyToId = Number(lastCommentId || postId);
        const messageId = await this.sendMessage(accessToken, commentPost, replyToId);
        if (messageId) {
            return [
                {
                    id: commentPost.id,
                    postId: String(messageId),
                    releaseURL: `https://t.me/${id !== 'undefined' ? id : `c/${accessToken.replace('-100', '')}`}/${messageId}`,
                    status: 'completed',
                },
            ];
        }
        return [];
    }
    chunkMedia(media, size) {
        const result = [];
        for (let i = 0; i < media.length; i += size) {
            result.push(media.slice(i, i + size));
        }
        return result;
    }
    async botIsAdmin(chatId, botId) {
        try {
            const chatMember = await telegramBot.getChatMember(chatId, botId);
            if (chatMember.status === 'administrator' ||
                chatMember.status === 'creator') {
                const permissions = chatMember.can_delete_messages;
                return !!permissions;
            }
            return false;
        }
        catch (error) {
            console.error('Error checking bot privileges:', error);
            return false;
        }
    }
}
exports.TelegramProvider = TelegramProvider;
//# sourceMappingURL=telegram.provider.js.map