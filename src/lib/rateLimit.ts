import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
    interval: number; // in milliseconds
    uniqueTokenPerInterval: number;
};

/**
 * Rate limiter using LRU cache
 * @param options - Configuration for rate limiting
 * @returns Function to check if request should be rate limited
 */
export function rateLimit(options: RateLimitOptions) {
    const tokenCache = new LRUCache({
        max: options.uniqueTokenPerInterval || 500,
        ttl: options.interval || 60000,
    });

    return {
        check: (limit: number, token: string): boolean => {
            const tokenCount = (tokenCache.get(token) as number[]) || [0];
            if (tokenCount[0] === 0) {
                tokenCache.set(token, [1]);
                return true;
            }

            if (tokenCount[0] >= limit) {
                return false; // Rate limited
            }

            tokenCount[0] += 1;
            tokenCache.set(token, tokenCount);
            return true;
        },
    };
}

/**
 * Create a rate limiter for API routes
 * Default: 10 requests per minute per IP
 */
export const apiRateLimiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500, // max 500 unique IPs per minute
});

/**
 * Get client IP from request
 */
export function getClientIp(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    return 'unknown';
}
