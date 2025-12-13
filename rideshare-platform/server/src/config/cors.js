const allowedOrigins = [
    'https://www.rideshare-app.com',
    'https://admin.rideshare-app.com',
    // We add specific local ports here just in case, 
    // but the dynamic logic below will also catch them.
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
];

const corsOptions = {
    origin: (origin, callback) => {
        // 1. Allow requests with no origin 
        // (Mobile Apps, Curl, Postman, server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        // 2. Check the explicitly allowed Whitelist
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // 3. Dynamic Development Logic
        // This allows ANY port on localhost/127.0.0.1 if not in production
        if (process.env.NODE_ENV !== 'production') {
            try {
                const url = new URL(origin);
                const allowedDevHosts = ['localhost', '127.0.0.1'];

                if (allowedDevHosts.includes(url.hostname)) {
                    // console.log(`[CORS] Allowed Development Origin: ${origin}`);
                    return callback(null, true);
                }
            } catch (error) {
                console.error('[CORS] Error parsing origin:', origin, error);
            }
        }

        // 4. If all checks fail, Block it
        console.log(`[CORS] BLOCKED: ${origin}`); // Keep this log to debug!
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true, // Required for cookies/sessions
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

module.exports = corsOptions;
