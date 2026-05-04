"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const errors_repository_1 = require("./errors.repository");
let ErrorsService = class ErrorsService {
    constructor(_errorsRepository) {
        this._errorsRepository = _errorsRepository;
    }
    listErrors(params) {
        return this._errorsRepository.listErrors(params);
    }
    listPlatforms() {
        return this._errorsRepository.listPlatforms();
    }
};
exports.ErrorsService = ErrorsService;
exports.ErrorsService = ErrorsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [errors_repository_1.ErrorsRepository])
], ErrorsService);
//# sourceMappingURL=errors.service.js.map