export declare class BillingSubscribeDto {
    period: 'MONTHLY' | 'YEARLY';
    billing: 'STANDARD' | 'PRO' | 'TEAM' | 'ULTIMATE';
    utm: string;
    dub: string;
    datafast_session_id: string;
    datafast_visitor_id: string;
}
