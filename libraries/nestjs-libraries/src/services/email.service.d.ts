import { EmailInterface } from '@gitroom/nestjs-libraries/emails/email.interface';
import { ResendProvider } from '@gitroom/nestjs-libraries/emails/resend.provider';
import { EmptyProvider } from '@gitroom/nestjs-libraries/emails/empty.provider';
import { NodeMailerProvider } from '@gitroom/nestjs-libraries/emails/node.mailer.provider';
import { TemporalService } from 'nestjs-temporal-core';
export declare class EmailService {
    private _temporalService;
    emailService: EmailInterface;
    constructor(_temporalService: TemporalService);
    hasProvider(): boolean;
    selectProvider(provider: string): ResendProvider | EmptyProvider | NodeMailerProvider;
    sendEmail(to: string, subject: string, html: string, addTo: 'top' | 'bottom', replyTo?: string): Promise<import("@temporalio/client").WorkflowHandleWithSignaledRunId<import("@temporalio/common").Workflow>>;
    sendEmailSync(to: string, subject: string, html: string, replyTo?: string): Promise<void>;
}
