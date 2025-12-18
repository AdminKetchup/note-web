// Production Console Logger
// Only logs in development, silent in production

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
    log: (...args: any[]) => {
        if (isDev) console.log(...args);
    },

    error: (...args: any[]) => {
        // Errors should always be logged
        console.error(...args);
    },

    warn: (...args: any[]) => {
        if (isDev) console.warn(...args);
    },

    info: (...args: any[]) => {
        if (isDev) console.info(...args);
    },

    debug: (...args: any[]) => {
        if (isDev) console.debug(...args);
    },
};

// For performance monitoring (always enabled but can be toggled)
export const perfLogger = {
    log: (name: string, duration: number) => {
        if (isDev || process.env.NEXT_PUBLIC_ENABLE_PERF_LOGS === 'true') {
            console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        }
    },
};

// For production monitoring (send to external service)
export const productionLogger = {
    error: (error: Error, context?: any) => {
        // Always log errors
        console.error(error, context);

        // TODO: Send to external monitoring service (Sentry, etc.)
        // if (!isDev) {
        //   sendToMonitoring(error, context);
        // }
    },
};
