/**
 * Safely access nested properties of an object using a dot-notation string.
 * @param {object} obj 
 * @param {string} path 
 * @returns {*}
 */
export const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
};

/**
 * Get the Tailwind CSS badge classes for a given trip status.
 * @param {string} status 
 * @returns {string}
 */
export const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        case 'accepted':
            // Fallthrough intended for now, or specific color
            return 'bg-blue-100 text-blue-800'; // Differentiating accepted
        case 'requested':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

/**
 * Get map display string for a location object or string
 * @param {string|object} location
 * @returns {string}
 */
export const formatLocation = (location) => {
    if (!location) return 'Map Pin';
    return typeof location === 'string' ? location : (location.address || 'Map Pin');
};
