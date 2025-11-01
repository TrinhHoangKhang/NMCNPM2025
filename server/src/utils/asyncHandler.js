// This function takes ANOTHER function (a controller) as an argument
const asyncHandler = (fn) => {
    // It returns a NEW function that Express will run
    return (req, res, next) => {
        // It runs the original function and chains .catch()
        // If an error occurs, it automatically passes it to 'next'
        // which sends it to your global errorHandler middleware.
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;