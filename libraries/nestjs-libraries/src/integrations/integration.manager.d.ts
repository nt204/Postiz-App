import 'reflect-metadata';
import { SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
export declare const socialIntegrationList: Array<SocialAbstract & SocialProvider>;
export declare class IntegrationManager {
    getAllIntegrations(): Promise<{
        social: {
            customFields?: {
                key: string;
                label: string;
                defaultValue?: string;
                validation: string;
                type: "text" | "password";
            }[];
            extensionCookies?: {
                name: string;
                domain: string;
            }[];
            name: string;
            identifier: string;
            toolTip: string;
            editor: "html" | "normal" | "none" | "markdown";
            isExternal: boolean;
            isWeb3: boolean;
            isChromeExtension: boolean;
        }[];
        article: any[];
    }>;
    getAllTools(): {
        [key: string]: {
            description: string;
            dataSchema: any;
            methodName: string;
        }[];
    };
    getAllRulesDescription(): {
        [key: string]: string;
    };
    getAllPlugs(): {
        name: string;
        identifier: string;
        plugs: any;
    }[];
    getInternalPlugs(providerName: string): {
        internalPlugs: any;
    };
    getAllowedSocialsIntegrations(): string[];
    getSocialIntegration(integration: string): SocialProvider;
}
