import * as nodePath from 'path';
import { TemporalModule } from 'nestjs-temporal-core';
import { socialIntegrationList } from '@gitroom/nestjs-libraries/integrations/integration.manager';

const makeWebpackConfigHook = (workflowsPath: string) => {
  // workflowsPath resolves to .../dist/apps/orchestrator/src/workflows/index.js
  // going up 4 dirs from workflows dir reaches the dist root
  const distRoot = nodePath.resolve(nodePath.dirname(workflowsPath), '../../../../');
  return (config: any) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@gitroom/orchestrator': nodePath.join(distRoot, 'apps/orchestrator/src'),
      '@gitroom/nestjs-libraries': nodePath.join(distRoot, 'libraries/nestjs-libraries/src'),
    };
    return config;
  };
};

export const getTemporalModule = (
  isWorkers: boolean,
  path?: string,
  activityClasses?: any[]
) => {
  return TemporalModule.register({
    isGlobal: true,
    connection: {
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
      ...process.env.TEMPORAL_TLS === 'true' ? {tls: true} : {},
      ...process.env.TEMPORAL_API_KEY ? {apiKey: process.env.TEMPORAL_API_KEY} : {},
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    },
    taskQueue: 'main',
    logLevel: 'error',
    ...(isWorkers
      ? {
          workers: [
            { identifier: 'main', maxConcurrentJob: undefined },
            ...socialIntegrationList,
          ]
            .filter((f) => f.identifier.indexOf('-') === -1)
            .map((integration) => ({
              taskQueue: integration.identifier.split('-')[0],
              workflowsPath: path!,
              activityClasses: activityClasses!,
              autoStart: true,
              workerOptions: {
                bundlerOptions: {
                  webpackConfigHook: makeWebpackConfigHook(path!),
                },
                ...(integration.maxConcurrentJob
                  ? {
                      maxConcurrentActivityTaskExecutions:
                        integration.maxConcurrentJob,
                    }
                  : {}),
              },
            })),
        }
      : {}),
  });
};
