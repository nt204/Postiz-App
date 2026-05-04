"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weightedLength = exports.textSlicer = void 0;
const tslib_1 = require("tslib");
const twitter_text_1 = tslib_1.__importDefault(require("twitter-text"));
const textSlicer = (integrationType, end, text) => {
    if (integrationType !== 'x') {
        return {
            start: 0,
            end,
        };
    }
    const { validRangeEnd, valid } = twitter_text_1.default.parseTweet(text, {
        version: 3,
        maxWeightedTweetLength: end,
        scale: 100,
        defaultWeight: 200,
        emojiParsingEnabled: true,
        transformedURLLength: 23,
        ranges: [
            { start: 0, end: 4351, weight: 100 },
            { start: 8192, end: 8205, weight: 100 },
            { start: 8208, end: 8223, weight: 100 },
            { start: 8242, end: 8247, weight: 100 },
        ],
    });
    return {
        start: 0,
        end: valid ? end : validRangeEnd,
    };
};
exports.textSlicer = textSlicer;
const weightedLength = (text) => {
    return twitter_text_1.default.parseTweet(text).weightedLength;
};
exports.weightedLength = weightedLength;
//# sourceMappingURL=count.length.js.map