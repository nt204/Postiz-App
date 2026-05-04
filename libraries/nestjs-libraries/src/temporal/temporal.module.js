"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemporalModule = void 0;
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
const integration_manager_1 = require("../integrations/integration.manager");
const getTemporalModule = (isWorkers, path, activityClasses) => {
    return nestjs_temporal_core_1.TemporalModule.register({
        isGlobal: true,
        connection: {
            address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
            ...process.env.TEMPORAL_TLS === 'true' ? { tls: true } : {},
            ...process.env.TEMPORAL_API_KEY ? { apiKey: process.env.TEMPORAL_API_KEY } : {},
            namespace: process.env.TEMPORAL_NAMESPACE || 'default',
        },
        taskQueue: 'main',
        logLevel: 'error',
        ...(isWorkers
            ? {
                workers: [
                    { identifier: 'main', maxConcurrentJob: undefined },
                    ...integration_manager_1.socialIntegrationList,
                ]
                    .filter((f) => f.identifier.indexOf('-') === -1)
                    .map((integration) => ({
                    taskQueue: integration.identifier.split('-')[0],
                    workflowsPath: path,
                    activityClasses: activityClasses,
                    autoStart: true,
                    ...(integration.maxConcurrentJob
                        ? {
                            workerOptions: {
                                maxConcurrentActivityTaskExecutions: integration.maxConcurrentJob,
                            },
                        }
                        : {}),
                })),
            }
            : {}),
    });
};
exports.getTemporalModule = getTemporalModule;
//# sourceMappingURL=temporal.module.js.map