const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    // Attempt to infer status code from error content if it wasn't set on res
    let finalStatus = statusCode;
    if (err.message === 'User already exists' || err.message === 'Username already taken') {
        finalStatus = 400;
    } else if (err.message === 'Invalid email or password') {
        finalStatus = 401;
    } else if (err.message === 'Invalid user data') {
        finalStatus = 400;
    } else if (err.name === 'ValidationError') {
        finalStatus = 400;
    }

    res.status(finalStatus);

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };
