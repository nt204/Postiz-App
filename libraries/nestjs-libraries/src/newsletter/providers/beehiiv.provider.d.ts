import { NewsletterInterface } from '@gitroom/nestjs-libraries/newsletter/newsletter.interface';
export declare class BeehiivProvider implements NewsletterInterface {
    name: string;
    register(email: string): Promise<void>;
}
