// 1. Load environment variables from .env file
require('dotenv').config(); 

// 2. Create and export the config object
module.exports = {
    // Application environment (e.g., 'development', 'production')
    env: process.env.NODE_ENV || 'development',

    // Server port
    port: process.env.PORT || 3000,

    // Database connection string
    database: {
        url: process.env.DATABASE_URL,
        options: {
            // Mongoose-specific options
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // JSON Web Token (JWT) secret
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d' // e.g., token expires in 1 day
    },

    // Third-party API keys
    apiKeys: {
        stripe: process.env.STRIPE_SECRET_KEY,
        sendgrid: process.env.SENDGRID_API_KEY
    }
};