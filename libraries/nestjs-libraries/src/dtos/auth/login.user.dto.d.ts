import { Provider } from '@prisma/client';
export declare class LoginUserDto {
    password: string;
    provider: Provider;
    providerToken: string;
    email: string;
    datafast_visitor_id: string;
}
