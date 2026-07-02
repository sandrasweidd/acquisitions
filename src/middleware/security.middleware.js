import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;

    switch (role) {
      case 'admin':
        limit = 20; // Admins can make 20 requests per minute
        break;
      case 'user':
        limit = 10; // Regular users can make 10 requests per minute
        break;
      case 'guest':
        limit = 5; // Guests can make 5 requests per minute
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-lomit`,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked', {
        ip: req.ip,
        userAgent: req.get('user-Agent'),
        path: req.path,
      });

      return res
        .status(403)
        .json({
          error: 'Forbiden',
          message: 'Automated requests are not allowed',
        });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield Blocked request', {
        ip: req.ip,
        userAgent: req.get('user-Agent'),
        path: req.path,
        method: req.method,
      });

      return res
        .status(403)
        .json({
          error: 'Forbiden',
          message: 'Requests blocked by security policy',
        });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate Limit exceeded', {
        ip: req.ip,
        userAgent: req.get('user-Agent'),
        path: req.path,
      });

      return res
        .status(403)
        .json({ error: 'Forbiden', message: 'Too many request' });
    }

    next();
  } catch (e) {
    console.error('Arcjet middleware error:', e);
    res
      .status(500)
      .json({
        error: 'Internal Server Error',
        message: 'Something went wrong with security middleware',
      });
  }
};

export default securityMiddleware;
