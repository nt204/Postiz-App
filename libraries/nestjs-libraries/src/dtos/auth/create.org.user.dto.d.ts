import { Provider } from '@prisma/client';
export declare class CreateOrgUserDto {
    password: string;
    provider: Provider;
    providerToken: string;
    email: string;
    company: string;
    datafast_visitor_id: string;
}
