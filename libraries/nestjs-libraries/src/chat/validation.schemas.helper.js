"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidationSchemas = getValidationSchemas;
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
const class_validator_1 = require("class-validator");
const storage_1 = require("class-transformer/cjs/storage");
function getValidationSchemas() {
    return (0, class_validator_jsonschema_1.validationMetadatasToSchemas)({
        classTransformerMetadataStorage: storage_1.defaultMetadataStorage,
        additionalConverters: {
            [class_validator_1.ValidationTypes.NESTED_VALIDATION]: (meta, options) => {
                if (typeof meta.target === 'function') {
                    const typeMeta = options.classTransformerMetadataStorage
                        ? options.classTransformerMetadataStorage.findTypeMetadata(meta.target, meta.propertyName)
                        : null;
                    if (typeMeta) {
                        const childType = typeMeta.typeFunction();
                        return (0, class_validator_jsonschema_1.targetConstructorToSchema)(childType, options);
                    }
                }
                return {};
            },
        },
    });
}
//# sourceMappingURL=validation.schemas.helper.js.map