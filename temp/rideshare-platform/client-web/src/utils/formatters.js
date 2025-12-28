/**
 * Format a date string into a localized date string.
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
};

/**
 * Format a date string into a localized time string (HH:MM).
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format a number as a currency string.
 * @param {number} amount 
 * @param {string} currencyCode 
 * @returns {string}
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
    if (amount === undefined || amount === null) return '-';
    // Simple formatting for now, can be upgraded to Intl.NumberFormat
    return `$${Number(amount).toFixed(2)}`;
};

/**
 * Format meters into kilometers with 2 decimal places.
 * @param {number} meters 
 * @returns {string}
 */
export const formatDistance = (meters) => {
    if (meters === undefined || meters === null) return '-';
    return `${(meters / 1000).toFixed(2)} km`;
};
