import { BeehiivProvider } from '@gitroom/nestjs-libraries/newsletter/providers/beehiiv.provider';
import { EmailEmptyProvider } from '@gitroom/nestjs-libraries/newsletter/providers/email-empty.provider';

export const newsletterProviders = [
  new BeehiivProvider(),
  new EmailEmptyProvider(),
];
