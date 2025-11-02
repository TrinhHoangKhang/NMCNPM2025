const express = require('express');
const app = express();
const port = 3000;

// Middleware function 'temp'
// This middleware will be executed for every incoming request because it's used with app.use()
function temp(req, res, next) {
    console.log("Template middleware executed");
    // Calling next() passes control to the next middleware function or route handler
    next();
}

// Middleware function 'login'
// This middleware is specific to certain routes (e.g., app.get("/", login, ...))
function login(req, res, next) {
    console.log("Login middleware executed");
    // You could perform authentication logic here.
    // If authentication fails, you might send an error response: res.status(401).send("Unauthorized");
    // If successful, call next() to proceed.
    next();
}

// Middleware function 'register'
// Similar to 'login', this is a route-specific middleware.
function register(req, res, next) {
    console.log("Register middleware executed");
    // Logic for user registration could go here.
    next();
}

// Middleware function 'auth'
// This middleware demonstrates conditional logic.
function auth(req, res, next) {
    console.log("Auth middleware executed");
    // Example: Check if a query parameter 'admin' is true.
    if (req.query.admin === 'true') {
        // If condition met, proceed to the next middleware/route handler.
        next();
    } else {
        // If condition not met, send a response and do NOT call next(),
        // effectively stopping the request-response cycle here.
        res.send("Not Allowed: You must be an admin.");
    }
}

// Middleware function 'logger'
// Another example of a simple logging middleware.
function logger(req, res, next) {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
}

// Global middleware: 'temp' will run for all requests
app.use(temp);
// Global middleware: 'logger' will run for all requests after 'temp'
app.use(logger);

// Route with 'login' middleware
app.get("/login", login, (req, res) => {
    res.send("Login Page");
});

// Route with 'register' middleware
app.post("/register", register, (req, res) => {
    res.send("Register User");
});

// Route with 'auth' middleware
app.get("/admin", auth, (req, res) => {
    res.send("Welcome, Admin!");
});

// Basic route
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});