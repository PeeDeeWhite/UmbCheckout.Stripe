﻿using Stripe;

namespace UmbCheckout.Stripe.Interfaces
{
    public interface IStripeShippingRateApiService
    {
        Task<StripeList<ShippingRate>> GetShippingRates();
    }
}
