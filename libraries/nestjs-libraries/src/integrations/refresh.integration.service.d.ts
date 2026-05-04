import { Integration } from '@prisma/client';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { AuthTokenDetails, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { TemporalService } from 'nestjs-temporal-core';
export declare class RefreshIntegrationService {
    private _integrationManager;
    private _integrationService;
    private _temporalService;
    constructor(_integrationManager: IntegrationManager, _integrationService: IntegrationService, _temporalService: TemporalService);
    refresh(integration: Integration, cause?: string): Promise<false | AuthTokenDetails>;
    setBetweenSteps(integration: Integration, cause?: string): Promise<void>;
    startRefreshWorkflow(orgId: string, id: string, integration: SocialProvider): Promise<false | import("@temporalio/client").WorkflowHandleWithStartDetails<import("@temporalio/common").Workflow>>;
    private refreshProcess;
}
