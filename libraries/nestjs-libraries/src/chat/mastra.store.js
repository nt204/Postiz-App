"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pStore = void 0;
const pg_1 = require("@mastra/pg");
exports.pStore = new pg_1.PostgresStore({
    id: 'postiz-store',
    connectionString: process.env.DATABASE_URL,
});
//# sourceMappingURL=mastra.store.js.map