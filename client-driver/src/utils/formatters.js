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
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return past.toLocaleDateString();
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
