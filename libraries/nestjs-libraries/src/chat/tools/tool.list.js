"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolList = void 0;
const integration_validation_tool_1 = require("./integration.validation.tool");
const integration_trigger_tool_1 = require("./integration.trigger.tool");
const integration_schedule_post_1 = require("./integration.schedule.post");
const generate_video_options_tool_1 = require("./generate.video.options.tool");
const video_function_tool_1 = require("./video.function.tool");
const generate_video_tool_1 = require("./generate.video.tool");
const generate_image_tool_1 = require("./generate.image.tool");
const integration_list_tool_1 = require("./integration.list.tool");
exports.toolList = [
    integration_list_tool_1.IntegrationListTool,
    integration_validation_tool_1.IntegrationValidationTool,
    integration_trigger_tool_1.IntegrationTriggerTool,
    integration_schedule_post_1.IntegrationSchedulePostTool,
    generate_video_options_tool_1.GenerateVideoOptionsTool,
    video_function_tool_1.VideoFunctionTool,
    generate_video_tool_1.GenerateVideoTool,
    generate_image_tool_1.GenerateImageTool,
];
//# sourceMappingURL=tool.list.js.map