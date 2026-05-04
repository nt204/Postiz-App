import Stripe from 'stripe';
import { Organization } from '@prisma/client';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { BillingSubscribeDto } from '@gitroom/nestjs-libraries/dtos/billing/billing.subscribe.dto';
import { TrackService } from '@gitroom/nestjs-libraries/track/track.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
export declare class StripeService {
    private _subscriptionService;
    private _organizationService;
    private _userService;
    private _trackService;
    constructor(_subscriptionService: SubscriptionService, _organizationService: OrganizationService, _userService: UsersService, _trackService: TrackService);
    validateRequest(rawBody: Buffer, signature: string, endpointSecret: string): Stripe.Event;
    checkValidCard(event: Stripe.CustomerSubscriptionCreatedEvent | Stripe.CustomerSubscriptionUpdatedEvent): Promise<boolean>;
    createSubscription(event: Stripe.CustomerSubscriptionCreatedEvent): Promise<void | {}>;
    updateSubscription(event: Stripe.CustomerSubscriptionUpdatedEvent): Promise<void | {}>;
    deleteSubscription(event: Stripe.CustomerSubscriptionDeletedEvent): Promise<void>;
    createOrGetCustomer(organization: Organization): Promise<string>;
    getPackages(): Promise<{
        [x: string]: {
            name: string;
            recurring: Stripe.Price.Recurring.Interval;
            price: number;
        }[];
    }>;
    prorate(organizationId: string, body: BillingSubscribeDto): Promise<{
        price: number;
    }>;
    getCustomerSubscriptions(organizationId: string): Promise<Stripe.Response<Stripe.ApiList<Stripe.Subscription>>>;
    setToCancel(organizationId: string): Promise<{
        id: string;
        cancel_at: Date;
    }>;
    getCustomerByOrganizationId(organizationId: string): Promise<string>;
    createBillingPortalLink(customer: string): Promise<Stripe.Response<Stripe.BillingPortal.Session>>;
    private findAutoApplyPromotionCode;
    private createEmbeddedCheckout;
    private createCheckoutSession;
    finishTrial(paymentId: string): Promise<Stripe.Response<Stripe.Subscription>>;
    checkDiscount(customer: string): Promise<boolean>;
    applyDiscount(customer: string): Promise<boolean>;
    checkSubscription(organizationId: string, subscriptionId: string): Promise<0 | 1 | 2>;
    embedded(uniqueId: string, organizationId: string, userId: string, body: BillingSubscribeDto, allowTrial: boolean): Promise<{
        auto_apply_coupon?: string;
        client_secret: string;
    }>;
    subscribe(uniqueId: string, organizationId: string, userId: string, body: BillingSubscribeDto, allowTrial: boolean): Promise<{
        url: string;
    } | {
        id: string;
        portal?: undefined;
    } | {
        portal: string;
        id?: undefined;
    }>;
    paymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent): Promise<{
        ok: boolean;
    }>;
    getCharges(organizationId: string): Promise<{
        invoice_pdf: string;
        id: string;
        amount: number;
        currency: string;
        created: number;
        status: Stripe.Charge.Status;
        refunded: boolean;
        amount_refunded: number;
        description: string;
        receipt_url: string;
        invoice: any;
    }[]>;
    refundCharges(organizationId: string, chargeIds: string[]): Promise<{
        refunded: string[];
        failed: string[];
    }>;
    cancelSubscription(organizationId: string): Promise<{
        cancelled: boolean;
    }>;
    lifetimeDeal(organizationId: string, code: string): Promise<{
        success: boolean;
    }>;
}
