import { formatMoney } from 'accounting';

// Original function
export const formatAmount = (amount: string | number | null | undefined) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        return 'Invalid amount';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'UGX',
    }).format(numericAmount);
};

// Enhanced function with accounting.js
export const formatAmountWithAccounting = (amount: string | number | null | undefined) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        return 'Invalid amount';
    }
    try {
        return formatMoney(numericAmount, {
            symbol: 'UGX',
            decimal: '.',
            thousand: ',',
            precision: 2,
            format: '%s%v',
        });
    } catch {
        return formatAmount(numericAmount); // Use numericAmount for fallback
    }
};
