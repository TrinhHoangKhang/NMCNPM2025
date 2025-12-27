export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        const formattedErrors = error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
        }));
        return res.status(400).json({
            success: false,
            errors: formattedErrors
        });
    }
};
