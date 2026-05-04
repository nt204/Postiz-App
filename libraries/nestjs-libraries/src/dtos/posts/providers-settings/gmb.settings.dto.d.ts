export declare class GmbSettingsDto {
    topicType?: 'STANDARD' | 'EVENT' | 'OFFER';
    callToActionType?: 'NONE' | 'BOOK' | 'ORDER' | 'SHOP' | 'LEARN_MORE' | 'SIGN_UP' | 'GET_OFFER' | 'CALL';
    callToActionUrl?: string;
    eventTitle?: string;
    eventStartDate?: string;
    eventEndDate?: string;
    eventStartTime?: string;
    eventEndTime?: string;
    offerCouponCode?: string;
    offerRedeemUrl?: string;
    offerTerms?: string;
}
