// This has 4 arguments, making it an error-handling middleware
const handleErrors = (err, req, res, next) => {
    // Log the error for the developer
    console.error(err.stack); 

    // Determine a safe status code
    const statusCode = err.statusCode || 500; 
    
    // Send a clean JSON response to the user
    res.status(statusCode).json({
        message: err.message || 'Something went wrong',
        // Optionally include more data in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { handleErrors };