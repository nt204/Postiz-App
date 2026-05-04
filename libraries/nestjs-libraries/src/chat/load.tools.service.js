"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadToolsService = exports.AgentState = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const agent_1 = require("@mastra/core/agent");
const openai_1 = require("@ai-sdk/openai");
const memory_1 = require("@mastra/memory");
const mastra_store_1 = require("./mastra.store");
const zod_1 = require("zod");
const core_1 = require("@nestjs/core");
const tool_list_1 = require("./tools/tool.list");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
exports.AgentState = (0, zod_1.object)({
    proverbs: (0, zod_1.array)((0, zod_1.string)()).default([]),
});
const renderArray = (list, show) => {
    if (!show)
        return '';
    return list.map((p) => `- ${p}`).join('\n');
};
let LoadToolsService = class LoadToolsService {
    constructor(_moduleRef) {
        this._moduleRef = _moduleRef;
    }
    async loadTools() {
        return (await Promise.all(tool_list_1.toolList
            .map((p) => this._moduleRef.get(p, { strict: false }))
            .map(async (p) => ({
            name: p.name,
            tool: await p.run(),
        })))).reduce((all, current) => ({
            ...all,
            [current.name]: current.tool,
        }), {});
    }
    async agent() {
        const tools = await this.loadTools();
        return new agent_1.Agent({
            id: 'postiz',
            name: 'postiz',
            description: 'Agent that helps manage and schedule social media posts for users',
            instructions: ({ requestContext }) => {
                const ui = requestContext.get('ui');
                return `
      Global information:
        - Date (UTC): ${(0, dayjs_1.default)().format('YYYY-MM-DD HH:mm:ss')}

      You are an agent that helps manage and schedule social media posts for users, you can:
        - Schedule posts into the future, or now, adding texts, images and videos
        - Generate pictures for posts
        - Generate videos for posts
        - Generate text for posts
        - Show global analytics about socials
        - List integrations (channels)
      
      - We schedule posts to different integration like facebook, instagram, etc. but to the user we don't say integrations we say channels as integration is the technical name
      - When scheduling a post, you must follow the social media rules and best practices.
      - When scheduling a post, you can pass an array for list of posts for a social media platform, But it has different behavior depending on the platform.
        - For platforms like Threads, Bluesky and X (Twitter), each post in the array will be a separate post in the thread.
        - For platforms like LinkedIn and Facebook, second part of the array will be added as "comments" to the first post.
        - If the social media platform has the concept of "threads", we need to ask the user if they want to create a thread or one long post.
        - For X, if you don't have Premium, don't suggest a long post because it won't work.
        - Platform format will also be passed can be "normal", "markdown", "html", make sure you use the correct format for each platform.
      
      - Sometimes 'integrationSchema' will return rules, make sure you follow them (these rules are set in stone, even if the user asks to ignore them)
      - Each socials media platform has different settings and rules, you can get them by using the integrationSchema tool.
      - Always make sure you use this tool before you schedule any post.
      - In every message I will send you the list of needed social medias (id and platform), if you already have the information use it, if not, use the integrationSchema tool to get it.
      - Make sure you always take the last information I give you about the socials, it might have changed.
      - Before scheduling a post, always make sure you ask the user confirmation by providing all the details of the post (text, images, videos, date, time, social media platform, account).
      - Between tools, we will reference things like: [output:name] and [input:name] to set the information right.
      - When outputting a date for the user, make sure it's human readable with time
      - The content of the post, HTML, Each line must be wrapped in <p> here is the possible tags: h1, h2, h3, u, strong, li, ul, p (you can\'t have u and strong together), don't use a "code" box
      ${renderArray([
                    'If the user confirm, ask if they would like to get a modal with populated content without scheduling the post yet or if they want to schedule it right away.',
                ], !!ui)}
`;
            },
            model: (0, openai_1.openai)('gpt-5.2'),
            tools,
            memory: new memory_1.Memory({
                storage: mastra_store_1.pStore,
                options: {
                    generateTitle: true,
                    workingMemory: {
                        enabled: true,
                        schema: exports.AgentState,
                    },
                },
            }),
        });
    }
};
exports.LoadToolsService = LoadToolsService;
exports.LoadToolsService = LoadToolsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.ModuleRef])
], LoadToolsService);
//# sourceMappingURL=load.tools.service.js.map