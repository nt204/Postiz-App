import { BeehiivProvider } from '@gitroom/nestjs-libraries/newsletter/providers/beehiiv.provider';
import { EmailEmptyProvider } from '@gitroom/nestjs-libraries/newsletter/providers/email-empty.provider';
import { ListmonkProvider } from '@gitroom/nestjs-libraries/newsletter/providers/listmonk.provider';
export declare const newsletterProviders: (BeehiivProvider | EmailEmptyProvider | ListmonkProvider)[];
