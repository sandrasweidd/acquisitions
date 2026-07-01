import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';

const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    if (req.cookies?.token) {
        return req.cookies.token;
    }

    if (req.headers['x-access-token']) {
        return req.headers['x-access-token'];
    }

    if (req.headers.token) {
        return req.headers.token;
    }

    if (req.query?.token) {
        return req.query.token;
    }

    const rawCookie = req.headers.cookie;
    if (rawCookie) {
        const tokenPair = rawCookie.split(';').map((part) => part.trim()).find((part) => part.startsWith('token='));
        if (tokenPair) {
            return tokenPair.substring('token='.length);
        }
    }

    return null;
};

export const requireAuth = (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        logger.warn('Authentication required: no token found');
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const user = jwttoken.verify(token);
        req.user = user;
        next();
    } catch (e) {
        logger.warn('Authentication failed', e);
        return res.status(401).json({ error: 'Authentication required' });
    }
};

export const requireRole = (roles = []) => (req, res, next) => {
    if (!req.user) {
        logger.warn('Authorization required: no authenticated user');
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
        logger.warn(`Authorization failed for role ${req.user.role}`);
        return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
};
