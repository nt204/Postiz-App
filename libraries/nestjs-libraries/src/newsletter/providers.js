"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsletterProviders = void 0;
const beehiiv_provider_1 = require("./providers/beehiiv.provider");
const email_empty_provider_1 = require("./providers/email-empty.provider");
const listmonk_provider_1 = require("./providers/listmonk.provider");
exports.newsletterProviders = [
    new beehiiv_provider_1.BeehiivProvider(),
    new listmonk_provider_1.ListmonkProvider(),
    new email_empty_provider_1.EmailEmptyProvider(),
];
//# sourceMappingURL=providers.js.map