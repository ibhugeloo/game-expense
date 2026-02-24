const FALLBACK_RATES = {
    EUR: 1,
    USD: 0.92,
    GBP: 1.17,
    JPY: 0.0062,
};

/**
 * Convert a price to EUR using the live USD→EUR exchange rate.
 * GBP and JPY rates are derived from the USD rate.
 */
export function toEUR(price, currency, exchangeRate = FALLBACK_RATES.USD) {
    if (currency === 'EUR') return price;
    if (currency === 'USD') return price * exchangeRate;
    // Derive GBP and JPY from the live USD rate ratio
    const usdRatio = exchangeRate / FALLBACK_RATES.USD;
    if (currency === 'GBP') return price * FALLBACK_RATES.GBP * usdRatio;
    if (currency === 'JPY') return price * FALLBACK_RATES.JPY * usdRatio;
    return price;
}
