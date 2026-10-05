const asyncHandler = (asyncFn) => async (req, res, next) => {
    try {
        return await asyncFn(req, res, next);
    } catch (error) {
        // Check if it's an instance of apiError or a standard error
        const statusCode = error.statusCode || 500;

        // Stack traces only for unexpected failures; expected errors (apiError,
        // e.g. 401/404/503) get a one-line log.
        if (error.name === "apiError" || error.constructor?.name === "apiError") {
            if (statusCode >= 500) console.warn(`[${req.method} ${req.originalUrl}] ${statusCode}: ${error.message}`);
        } else {
            console.error(error);
        }
        const message = error.message || "Internal Server Error";

        return res.status(statusCode).json({
            success: false,
            message: message 
        });
    }
};

export default asyncHandler;