"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const tslib_1 = require("tslib");
const stripe_1 = tslib_1.__importDefault(require("stripe"));
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("../database/prisma/subscriptions/subscription.service");
const organization_service_1 = require("../database/prisma/organizations/organization.service");
const make_is_1 = require("./make.is");
const lodash_1 = require("lodash");
const pricing_1 = require("../database/prisma/subscriptions/pricing");
const auth_service_1 = require("../../../helpers/src/auth/auth.service");
const track_service_1 = require("../track/track.service");
const users_service_1 = require("../database/prisma/users/users.service");
const track_enum_1 = require("../user/track.enum");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_nothing');
let StripeService = class StripeService {
    constructor(_subscriptionService, _organizationService, _userService, _trackService) {
        this._subscriptionService = _subscriptionService;
        this._organizationService = _organizationService;
        this._userService = _userService;
        this._trackService = _trackService;
    }
    validateRequest(rawBody, signature, endpointSecret) {
        return stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    }
    async checkValidCard(event) {
        if (event.data.object.status === 'incomplete') {
            return false;
        }
        const getOrgFromCustomer = await this._organizationService.getOrgByCustomerId(event.data.object.customer);
        if (!getOrgFromCustomer?.allowTrial) {
            return true;
        }
        console.log('Checking card');
        const paymentMethods = await stripe.paymentMethods.list({
            customer: event.data.object.customer,
        });
        const latestMethod = paymentMethods.data.reduce((prev, current) => {
            if (prev.created < current.created) {
                return current;
            }
            return prev;
        }, { created: -100 });
        if (!latestMethod.id) {
            return false;
        }
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 100,
                currency: 'usd',
                payment_method: latestMethod.id,
                customer: event.data.object.customer,
                automatic_payment_methods: {
                    allow_redirects: 'never',
                    enabled: true,
                },
                capture_method: 'manual',
                confirm: true,
            });
            if (paymentIntent.status !== 'requires_capture') {
                console.error('Cant charge');
                await stripe.paymentMethods.detach(paymentMethods.data[0].id);
                await stripe.subscriptions.cancel(event.data.object.id);
                return false;
            }
            await stripe.paymentIntents.cancel(paymentIntent.id);
            return true;
        }
        catch (err) {
            try {
                await stripe.paymentMethods.detach(paymentMethods.data[0].id);
                await stripe.subscriptions.cancel(event.data.object.id);
            }
            catch (err) {
            }
            return false;
        }
    }
    async createSubscription(event) {
        const { uniqueId, billing, period, } = event.data.object.metadata;
        try {
            const check = await this.checkValidCard(event);
            if (!check) {
                return { ok: false };
            }
        }
        catch (err) {
            return { ok: false };
        }
        return this._subscriptionService.createOrUpdateSubscription(event.data.object.status !== 'active', uniqueId, event.data.object.customer, pricing_1.pricing[billing].channel, billing, period, event.data.object.cancel_at);
    }
    async updateSubscription(event) {
        const { uniqueId, billing, period, } = event.data.object.metadata;
        const check = await this.checkValidCard(event);
        if (!check) {
            return { ok: false };
        }
        return this._subscriptionService.createOrUpdateSubscription(event.data.object.status !== 'active', uniqueId, event.data.object.customer, pricing_1.pricing[billing].channel, billing, period, event.data.object.cancel_at);
    }
    async deleteSubscription(event) {
        await this._subscriptionService.deleteSubscription(event.data.object.customer);
    }
    async createOrGetCustomer(organization) {
        if (organization.paymentId) {
            return organization.paymentId;
        }
        const users = await this._organizationService.getTeam(organization.id);
        const customer = await stripe.customers.create({
            email: users.users[0].user.email.indexOf('@') > -1 ? users.users[0].user.email : `${users.users[0].user.email}@postiz.com`,
            name: organization.name,
        });
        await this._subscriptionService.updateCustomerId(organization.id, customer.id);
        return customer.id;
    }
    async getPackages() {
        const products = await stripe.prices.list({
            active: true,
            expand: ['data.tiers', 'data.product'],
            lookup_keys: [
                'standard_monthly',
                'standard_yearly',
                'pro_monthly',
                'pro_yearly',
            ],
        });
        const productsList = (0, lodash_1.groupBy)(products.data.map((p) => ({
            name: p.product?.name,
            recurring: p?.recurring?.interval,
            price: p?.tiers?.[0]?.unit_amount / 100,
        })), 'recurring');
        return { ...productsList };
    }
    async prorate(organizationId, body) {
        const org = await this._organizationService.getOrgById(organizationId);
        const customer = await this.createOrGetCustomer(org);
        const priceData = pricing_1.pricing[body.billing];
        const allProducts = await stripe.products.list({
            active: true,
            expand: ['data.prices'],
        });
        const findProduct = allProducts.data.find((product) => product.name.toUpperCase() === body.billing.toUpperCase()) ||
            (await stripe.products.create({
                active: true,
                name: body.billing,
            }));
        const pricesList = await stripe.prices.list({
            active: true,
            product: findProduct.id,
        });
        const findPrice = pricesList.data.find((p) => p?.recurring?.interval?.toLowerCase() ===
            (body.period === 'MONTHLY' ? 'month' : 'year') &&
            p?.nickname === body.billing + ' ' + body.period &&
            p?.unit_amount ===
                (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) *
                    100) ||
            (await stripe.prices.create({
                active: true,
                product: findProduct.id,
                currency: 'usd',
                nickname: body.billing + ' ' + body.period,
                unit_amount: (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) * 100,
                recurring: {
                    interval: body.period === 'MONTHLY' ? 'month' : 'year',
                },
            }));
        const proration_date = Math.floor(Date.now() / 1000);
        const currentUserSubscription = {
            data: (await stripe.subscriptions.list({
                customer,
                status: 'all',
            })).data.filter((f) => f.status === 'active' || f.status === 'trialing'),
        };
        try {
            const price = await stripe.invoices.createPreview({
                customer,
                subscription: currentUserSubscription?.data?.[0]?.id,
                subscription_details: {
                    proration_behavior: 'create_prorations',
                    billing_cycle_anchor: 'now',
                    items: [
                        {
                            id: currentUserSubscription?.data?.[0]?.items?.data?.[0]?.id,
                            price: findPrice?.id,
                            quantity: 1,
                        },
                    ],
                    proration_date: proration_date,
                },
            });
            return {
                price: price?.amount_remaining ? price?.amount_remaining / 100 : 0,
            };
        }
        catch (err) {
            return { price: 0 };
        }
    }
    async getCustomerSubscriptions(organizationId) {
        const org = (await this._organizationService.getOrgById(organizationId));
        const customer = org.paymentId;
        return stripe.subscriptions.list({
            customer: customer,
            status: 'all',
        });
    }
    async setToCancel(organizationId) {
        const id = (0, make_is_1.makeId)(10);
        const org = await this._organizationService.getOrgById(organizationId);
        const customer = await this.createOrGetCustomer(org);
        const currentUserSubscription = {
            data: (await stripe.subscriptions.list({
                customer,
                status: 'all',
                expand: ['data.latest_invoice'],
            })).data.filter((f) => f.status !== 'canceled'),
        };
        const sub = currentUserSubscription.data[0];
        if (sub.cancel_at_period_end) {
            const { cancel_at } = await stripe.subscriptions.update(sub.id, {
                cancel_at_period_end: false,
                metadata: { service: 'gitroom', id },
            });
            return {
                id,
                cancel_at: cancel_at ? new Date(cancel_at * 1000) : undefined,
            };
        }
        const latestInvoice = sub.latest_invoice;
        const hasFailedPayment = sub.status === 'past_due' ||
            latestInvoice?.status === 'open' ||
            latestInvoice?.status === 'uncollectible';
        if (hasFailedPayment) {
            await stripe.subscriptions.cancel(sub.id);
            await this._subscriptionService.deleteSubscription(customer);
            return {
                id,
                cancel_at: new Date(),
            };
        }
        const { cancel_at } = await stripe.subscriptions.update(sub.id, {
            cancel_at_period_end: true,
            metadata: { service: 'gitroom', id },
        });
        return {
            id,
            cancel_at: cancel_at ? new Date(cancel_at * 1000) : undefined,
        };
    }
    async getCustomerByOrganizationId(organizationId) {
        const org = (await this._organizationService.getOrgById(organizationId));
        return org.paymentId;
    }
    async createBillingPortalLink(customer) {
        return stripe.billingPortal.sessions.create({
            customer,
            return_url: process.env['FRONTEND_URL'] + '/billing',
        });
    }
    async findAutoApplyPromotionCode() {
        try {
            const promotionCodes = await stripe.promotionCodes.list({
                active: true,
                limit: 100,
            });
            const now = Math.floor(Date.now() / 1000);
            for (const promoCode of promotionCodes.data) {
                const coupon = typeof promoCode.promotion.coupon === 'string'
                    ? null
                    : promoCode.promotion.coupon;
                const autoApply = Object.assign({}, promoCode.metadata, coupon?.metadata)?.autoapply;
                if (autoApply !== 'true')
                    continue;
                if (promoCode.expires_at && promoCode.expires_at < now)
                    continue;
                if (coupon?.redeem_by && coupon.redeem_by < now)
                    continue;
                if (promoCode.max_redemptions &&
                    promoCode.times_redeemed >= promoCode.max_redemptions)
                    continue;
                return promoCode.code;
            }
            return null;
        }
        catch (err) {
            console.error('Error finding auto-apply promotion code:', err);
            return null;
        }
    }
    async createEmbeddedCheckout(ud, uniqueId, customer, body, price, userId, allowTrial) {
        const user = await this._userService.getUserById(userId);
        try {
            await stripe.customers.update(customer, {
                email: user.email.indexOf('@') > -1 ? user.email : `${user.email}@postiz.com`,
                ...(body.dub
                    ? {
                        metadata: {
                            dubCustomerExternalId: userId,
                            dubClickId: body.dub,
                        },
                    }
                    : {}),
            });
        }
        catch (err) { }
        let autoApplyPromoCode = null;
        if (body.period === 'MONTHLY') {
            autoApplyPromoCode = await this.findAutoApplyPromotionCode();
        }
        const isUtm = body.utm ? `&utm_source=${body.utm}` : '';
        const { client_secret } = await stripe.checkout.sessions.create({
            ui_mode: 'custom',
            customer,
            return_url: process.env['FRONTEND_URL'] +
                `/launches?onboarding=true&check=${uniqueId}${isUtm}`,
            mode: 'subscription',
            subscription_data: {
                ...(allowTrial ? { trial_period_days: 7 } : {}),
                metadata: {
                    service: 'gitroom',
                    ...body,
                    userId,
                    uniqueId,
                    ud,
                },
            },
            ...(body.datafast_session_id && body.datafast_visitor_id
                ? {
                    metadata: {
                        datafast_visitor_id: body.datafast_visitor_id,
                        datafast_session_id: body.datafast_session_id,
                    },
                }
                : {}),
            allow_promotion_codes: body.period === 'MONTHLY',
            line_items: [
                {
                    price,
                    quantity: 1,
                },
            ],
        });
        return {
            client_secret,
            ...(autoApplyPromoCode ? { auto_apply_coupon: autoApplyPromoCode } : {}),
        };
    }
    async createCheckoutSession(ud, uniqueId, customer, body, price, userId, allowTrial) {
        const isUtm = body.utm ? `&utm_source=${body.utm}` : '';
        if (body.dub) {
            await stripe.customers.update(customer, {
                metadata: {
                    dubCustomerExternalId: userId,
                    dubClickId: body.dub,
                },
            });
        }
        const { url } = await stripe.checkout.sessions.create({
            customer,
            cancel_url: process.env['FRONTEND_URL'] + `/billing?cancel=true${isUtm}`,
            success_url: process.env['FRONTEND_URL'] +
                `/launches?onboarding=true&check=${uniqueId}${isUtm}`,
            mode: 'subscription',
            subscription_data: {
                ...(allowTrial ? { trial_period_days: 7 } : {}),
                metadata: {
                    service: 'gitroom',
                    ...body,
                    userId,
                    uniqueId,
                    ud,
                },
            },
            allow_promotion_codes: body.period === 'MONTHLY',
            line_items: [
                {
                    price,
                    quantity: 1,
                },
            ],
        });
        return { url };
    }
    async finishTrial(paymentId) {
        const list = (await stripe.subscriptions.list({
            customer: paymentId,
        })).data.filter((f) => f.status === 'trialing');
        return stripe.subscriptions.update(list[0].id, {
            trial_end: 'now',
        });
    }
    async checkDiscount(customer) {
        if (!process.env.STRIPE_DISCOUNT_ID) {
            return false;
        }
        const list = await stripe.charges.list({
            customer,
            limit: 1,
        });
        if (!list.data.filter((f) => f.amount > 1000).length) {
            return false;
        }
        const currentUserSubscription = {
            data: (await stripe.subscriptions.list({
                customer,
                status: 'all',
                expand: ['data.discounts'],
            })).data.find((f) => f.status === 'active' || f.status === 'trialing'),
        };
        if (!currentUserSubscription) {
            return false;
        }
        if (currentUserSubscription.data?.items.data[0]?.price.recurring?.interval ===
            'year' ||
            currentUserSubscription.data?.discounts.length) {
            return false;
        }
        return true;
    }
    async applyDiscount(customer) {
        const check = this.checkDiscount(customer);
        if (!check) {
            return false;
        }
        const currentUserSubscription = {
            data: (await stripe.subscriptions.list({
                customer,
                status: 'all',
                expand: ['data.discounts'],
            })).data.find((f) => f.status === 'active' || f.status === 'trialing'),
        };
        await stripe.subscriptions.update(currentUserSubscription.data.id, {
            discounts: [
                {
                    coupon: process.env.STRIPE_DISCOUNT_ID,
                },
            ],
        });
        return true;
    }
    async checkSubscription(organizationId, subscriptionId) {
        const orgValue = await this._subscriptionService.checkSubscription(organizationId, subscriptionId);
        if (orgValue) {
            return 2;
        }
        const getCustomerSubscriptions = await this.getCustomerSubscriptions(organizationId);
        if (getCustomerSubscriptions.data.length === 0) {
            return 0;
        }
        if (getCustomerSubscriptions.data.find((p) => p.metadata.uniqueId === subscriptionId)?.canceled_at) {
            return 1;
        }
        return 0;
    }
    async embedded(uniqueId, organizationId, userId, body, allowTrial) {
        const id = (0, make_is_1.makeId)(10);
        const priceData = pricing_1.pricing[body.billing];
        const org = await this._organizationService.getOrgById(organizationId);
        const customer = await this.createOrGetCustomer(org);
        const allProducts = await stripe.products.list({
            active: true,
            expand: ['data.prices'],
        });
        const findProduct = allProducts.data.find((product) => product.name.toUpperCase() === body.billing.toUpperCase()) ||
            (await stripe.products.create({
                active: true,
                name: body.billing,
            }));
        const pricesList = await stripe.prices.list({
            active: true,
            product: findProduct.id,
        });
        const findPrice = pricesList.data.find((p) => p?.recurring?.interval?.toLowerCase() ===
            (body.period === 'MONTHLY' ? 'month' : 'year') &&
            p?.unit_amount ===
                (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) *
                    100) ||
            (await stripe.prices.create({
                active: true,
                product: findProduct.id,
                currency: 'usd',
                nickname: body.billing + ' ' + body.period,
                unit_amount: (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) * 100,
                recurring: {
                    interval: body.period === 'MONTHLY' ? 'month' : 'year',
                },
            }));
        return this.createEmbeddedCheckout(uniqueId, id, customer, body, findPrice.id, userId, allowTrial);
    }
    async subscribe(uniqueId, organizationId, userId, body, allowTrial) {
        const id = (0, make_is_1.makeId)(10);
        const priceData = pricing_1.pricing[body.billing];
        const org = await this._organizationService.getOrgById(organizationId);
        const customer = await this.createOrGetCustomer(org);
        const allProducts = await stripe.products.list({
            active: true,
            expand: ['data.prices'],
        });
        const findProduct = allProducts.data.find((product) => product.name.toUpperCase() === body.billing.toUpperCase()) ||
            (await stripe.products.create({
                active: true,
                name: body.billing,
            }));
        const pricesList = await stripe.prices.list({
            active: true,
            product: findProduct.id,
        });
        const findPrice = pricesList.data.find((p) => p?.recurring?.interval?.toLowerCase() ===
            (body.period === 'MONTHLY' ? 'month' : 'year') &&
            p?.unit_amount ===
                (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) *
                    100) ||
            (await stripe.prices.create({
                active: true,
                product: findProduct.id,
                currency: 'usd',
                nickname: body.billing + ' ' + body.period,
                unit_amount: (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) * 100,
                recurring: {
                    interval: body.period === 'MONTHLY' ? 'month' : 'year',
                },
            }));
        const getCurrentSubscriptions = await this._subscriptionService.getSubscription(organizationId);
        if (!getCurrentSubscriptions) {
            return this.createCheckoutSession(uniqueId, id, customer, body, findPrice.id, userId, allowTrial);
        }
        const currentUserSubscription = {
            data: (await stripe.subscriptions.list({
                customer,
                status: 'all',
            })).data.filter((f) => f.status === 'active' || f.status === 'trialing'),
        };
        try {
            await stripe.subscriptions.update(currentUserSubscription.data[0].id, {
                cancel_at_period_end: false,
                metadata: {
                    service: 'gitroom',
                    ...body,
                    userId,
                    id,
                    ud: uniqueId,
                },
                proration_behavior: 'always_invoice',
                items: [
                    {
                        id: currentUserSubscription.data[0].items.data[0].id,
                        price: findPrice.id,
                        quantity: 1,
                    },
                ],
            });
            return { id };
        }
        catch (err) {
            const { url } = await this.createBillingPortalLink(customer);
            return {
                portal: url,
            };
        }
    }
    async paymentSucceeded(event) {
        const subscriptionId = event.data.object.parent?.subscription_details?.subscription;
        if (!subscriptionId) {
            return { ok: true };
        }
        const subscription = await stripe.subscriptions.retrieve(typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id);
        const { userId, ud } = subscription.metadata;
        const user = await this._userService.getUserById(userId);
        if (user && user.ip && user.agent) {
            this._trackService.track(ud, user.ip, user.agent, track_enum_1.TrackEnum.Purchase, {
                value: event.data.object.amount_paid / 100,
            });
        }
        return { ok: true };
    }
    async getCharges(organizationId) {
        const org = await this._organizationService.getOrgById(organizationId);
        if (!org?.paymentId) {
            return [];
        }
        const charges = await stripe.charges.list({
            customer: org.paymentId,
            limit: 100,
        });
        const chargeList = charges.data
            .filter((f) => f.status === 'succeeded')
            .map((charge) => ({
            id: charge.id,
            amount: charge.amount,
            currency: charge.currency,
            created: charge.created,
            status: charge.status,
            refunded: charge.refunded,
            amount_refunded: charge.amount_refunded,
            description: charge.description,
            receipt_url: charge.receipt_url || null,
            invoice: charge.invoice || null,
        }));
        const invoiceIds = chargeList
            .map((c) => c.invoice)
            .filter((id) => !!id && typeof id === 'string');
        const invoicePdfMap = {};
        for (const invoiceId of invoiceIds) {
            try {
                const inv = await stripe.invoices.retrieve(invoiceId);
                if (inv.invoice_pdf) {
                    invoicePdfMap[invoiceId] = inv.invoice_pdf;
                }
            }
            catch {
            }
        }
        return chargeList.map((charge) => ({
            ...charge,
            invoice_pdf: charge.invoice && invoicePdfMap[charge.invoice]
                ? invoicePdfMap[charge.invoice]
                : null,
        }));
    }
    async refundCharges(organizationId, chargeIds) {
        const org = await this._organizationService.getOrgById(organizationId);
        if (!org?.paymentId) {
            throw new Error('No payment customer found for this organization');
        }
        const refunded = [];
        const failed = [];
        for (const chargeId of chargeIds) {
            try {
                await stripe.refunds.create({ charge: chargeId });
                refunded.push(chargeId);
            }
            catch (err) {
                failed.push(chargeId);
            }
        }
        return { refunded, failed };
    }
    async cancelSubscription(organizationId) {
        const org = await this._organizationService.getOrgById(organizationId);
        if (!org?.paymentId) {
            throw new Error('No payment customer found for this organization');
        }
        const customer = org.paymentId;
        const subscriptions = (await stripe.subscriptions.list({
            customer,
            status: 'all',
        })).data.filter((f) => f.status !== 'canceled');
        if (!subscriptions.length) {
            throw new Error('No active subscription found');
        }
        await stripe.subscriptions.cancel(subscriptions[0].id);
        await this._subscriptionService.deleteSubscription(customer);
        return { cancelled: true };
    }
    async lifetimeDeal(organizationId, code) {
        const getCurrentSubscription = await this._subscriptionService.getSubscriptionByOrganizationId(organizationId);
        if (getCurrentSubscription && !getCurrentSubscription?.isLifetime) {
            throw new Error('You already have a non lifetime subscription');
        }
        try {
            const testCode = auth_service_1.AuthService.fixedDecryption(code);
            const findCode = await this._subscriptionService.getCode(testCode);
            if (findCode) {
                return {
                    success: false,
                };
            }
            const nextPackage = !getCurrentSubscription ? 'STANDARD' : 'PRO';
            const findPricing = pricing_1.pricing[nextPackage];
            await this._subscriptionService.createOrUpdateSubscription(false, (0, make_is_1.makeId)(10), organizationId, getCurrentSubscription?.subscriptionTier === 'PRO'
                ? getCurrentSubscription.totalChannels + 5
                : findPricing.channel, nextPackage, 'MONTHLY', null, testCode, organizationId);
            return {
                success: true,
            };
        }
        catch (err) {
            console.log(err);
            return {
                success: false,
            };
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        organization_service_1.OrganizationService,
        users_service_1.UsersService,
        track_service_1.TrackService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map