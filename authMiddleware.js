const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and attach decoded user payload to req.user
 */
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];

        // 1. Check if Authorization header is provided
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // 2. Extract Bearer token
        let token = authHeader;
        if (typeof authHeader === 'string' && (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer '))) {
            token = authHeader.slice(7).trim();
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token is missing or malformed.'
            });
        }

        // 3. Verify JWT token
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_123';
        const decoded = jwt.verify(token, jwtSecret);

        // 4. Attach decoded user payload to req.user
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please log in again.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid token. Authentication failed.'
        });
    }
};

module.exports = authMiddleware;
