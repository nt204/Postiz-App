"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorsRepository = void 0;
const tslib_1 = require("tslib");
const prisma_service_1 = require("../prisma.service");
const common_1 = require("@nestjs/common");
const UNKNOWN_TOKEN = 'An unknown error occurred';
let ErrorsRepository = class ErrorsRepository {
    constructor(_errors) {
        this._errors = _errors;
    }
    buildWhere(params) {
        const where = {};
        if (params.platform) {
            where.platform = params.platform;
        }
        if (params.email) {
            where.organization = {
                users: {
                    some: {
                        user: {
                            email: { contains: params.email, mode: 'insensitive' },
                        },
                    },
                },
            };
        }
        return where;
    }
    get include() {
        return {
            organization: {
                select: {
                    id: true,
                    name: true,
                    users: {
                        select: {
                            user: { select: { id: true, email: true, name: true } },
                        },
                    },
                },
            },
            post: { select: { id: true, content: true } },
        };
    }
    async listPlatforms() {
        const rows = await this._errors.model.errors.findMany({
            distinct: ['platform'],
            select: { platform: true },
            orderBy: { platform: 'asc' },
        });
        return rows.map((r) => r.platform);
    }
    async listErrors(params) {
        const page = Math.max(0, params.page || 0);
        const limit = Math.min(Math.max(1, params.limit || 20), 100);
        const skip = page * limit;
        const where = this.buildWhere(params);
        const include = this.include;
        if (!params.unknownFirst) {
            const [items, total] = await Promise.all([
                this._errors.model.errors.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                    include,
                }),
                this._errors.model.errors.count({ where }),
            ]);
            return {
                items,
                total,
                page,
                limit,
                hasMore: skip + items.length < total,
            };
        }
        const unknownWhere = { ...where, message: { contains: UNKNOWN_TOKEN } };
        const knownWhere = {
            ...where,
            NOT: { message: { contains: UNKNOWN_TOKEN } },
        };
        const [unknownTotal, knownTotal] = await Promise.all([
            this._errors.model.errors.count({ where: unknownWhere }),
            this._errors.model.errors.count({ where: knownWhere }),
        ]);
        let unknownItems = [];
        let knownItems = [];
        if (skip < unknownTotal) {
            const takeUnknown = Math.min(unknownTotal - skip, limit);
            unknownItems = await this._errors.model.errors.findMany({
                where: unknownWhere,
                orderBy: { createdAt: 'desc' },
                skip,
                take: takeUnknown,
                include,
            });
            const remaining = limit - unknownItems.length;
            if (remaining > 0) {
                knownItems = await this._errors.model.errors.findMany({
                    where: knownWhere,
                    orderBy: { createdAt: 'desc' },
                    skip: 0,
                    take: remaining,
                    include,
                });
            }
        }
        else {
            knownItems = await this._errors.model.errors.findMany({
                where: knownWhere,
                orderBy: { createdAt: 'desc' },
                skip: skip - unknownTotal,
                take: limit,
                include,
            });
        }
        const items = [...unknownItems, ...knownItems];
        const total = unknownTotal + knownTotal;
        return {
            items,
            total,
            page,
            limit,
            hasMore: skip + items.length < total,
        };
    }
};
exports.ErrorsRepository = ErrorsRepository;
exports.ErrorsRepository = ErrorsRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaRepository])
], ErrorsRepository);
//# sourceMappingURL=errors.repository.js.map