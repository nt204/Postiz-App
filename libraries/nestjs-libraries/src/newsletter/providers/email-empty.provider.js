"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailEmptyProvider = void 0;
class EmailEmptyProvider {
    constructor() {
        this.name = 'empty';
    }
    async register(email) {
        console.log('Could have registered to newsletter:', email);
    }
}
exports.EmailEmptyProvider = EmailEmptyProvider;
//# sourceMappingURL=email-empty.provider.js.map