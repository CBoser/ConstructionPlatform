import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { CorsOptions } from 'cors';

/**
 * CORS Configuration Middleware
 *
 * Implements whitelist-based origin checking for enhanced security.
 * Only allows requests from explicitly configured origins.
 *
 * Environment Variables:
 * - ALLOWED_ORIGINS: Comma-separated list of allowed origins
 *   Example: "http://localhost:5173,https://yourdomain.com,https://www.yourdomain.com"
 *
 * Security Features:
 * - Whitelist-based origin validation
 * - Credentials support (cookies, auth headers)
 * - Preflight request caching (24 hours)
 * - Explicit allowed methods and headers
 * - Origin validation logging
 */

/**
 * Parse and validate allowed origins from environment variable
 */
function getAllowedOrigins(): string[] {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;

  if (!allowedOriginsEnv) {
    console.warn('');
    console.warn('⚠️  WARNING: ALLOWED_ORIGINS not configured');
    console.warn('   Using default development origins: http://localhost:5173, http://localhost:5174');
    console.warn('   Set ALLOWED_ORIGINS in production for security!');
    console.warn('');
    // Include common Vite development ports (5173 is default, 5174 is fallback when 5173 is in use)
    return ['http://localhost:5173', 'http://localhost:5174'];
  }

  // Parse comma-separated origins and trim whitespace
  const origins = allowedOriginsEnv
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);

  if (origins.length === 0) {
    console.error('');
    console.error('🔴 ERROR: ALLOWED_ORIGINS is set but empty');
    console.error('   Falling back to development origins: http://localhost:5173, http://localhost:5174');
    console.error('');
    return ['http://localhost:5173', 'http://localhost:5174'];
  }

  // Log configured origins (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ [cors]: Configured allowed origins:');
    origins.forEach(origin => console.log(`   - ${origin}`));
  } else {
    console.log(`✅ [cors]: ${origins.length} origin(s) whitelisted`);
  }

  return origins;
}

/**
 * CORS options configuration
 */
const allowedOrigins = getAllowedOrigins();

const corsOptions: CorsOptions = {
  /**
   * Origin validation function
   * Checks if the request origin is in the whitelist
   */
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    // or from whitelisted origins
    if (!origin) {
      // No origin header (non-browser requests like Postman, mobile apps, server-to-server)
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      // Origin is whitelisted
      callback(null, true);
    } else {
      // Origin is NOT whitelisted - reject the request
      console.warn('🚫 [cors]: Blocked request from unauthorized origin:', origin);
      callback(new Error(`CORS: Origin ${origin} is not allowed by CORS policy`));
    }
  },

  /**
   * Credentials support
   * Allows cookies and Authorization headers to be sent with requests
   */
  credentials: true,

  /**
   * Allowed HTTP methods
   * Explicitly define which methods are permitted
   */
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  /**
   * Allowed headers
   * Explicitly define which headers clients can use
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],

  /**
   * Exposed headers
   * Headers that browsers are allowed to access
   */
  exposedHeaders: ['Content-Range', 'X-Content-Range'],

  /**
   * Preflight cache duration (in seconds)
   * Browsers will cache preflight responses for 24 hours
   * Reduces OPTIONS requests overhead
   */
  maxAge: 86400, // 24 hours

  /**
   * Success status for preflight requests
   * 204 No Content is the standard for successful OPTIONS requests
   */
  optionsSuccessStatus: 204
};

/**
 * CORS middleware with error handling
 */
export const corsMiddleware = cors(corsOptions);

/**
 * CORS error handler
 * Catches and properly formats CORS errors
 */
export function corsErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err.message.startsWith('CORS:')) {
    // This is a CORS error
    res.status(403).json({
      error: 'CORS Policy Violation',
      message: 'This origin is not allowed to access this resource',
      origin: req.headers.origin || 'unknown'
    });
  } else {
    // Not a CORS error, pass to next error handler
    next(err);
  }
}

/**
 * Validate CORS configuration on startup
 */
export function validateCorsConfig(): boolean {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('  🔴 FATAL ERROR: ALLOWED_ORIGINS is not set in production!');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    console.error('  The ALLOWED_ORIGINS environment variable is REQUIRED in');
    console.error('  production to ensure only trusted origins can access the API.');
    console.error('');
    console.error('  Set ALLOWED_ORIGINS to a comma-separated list of origins:');
    console.error('    export ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"');
    console.error('');
    console.error('  DO NOT use wildcards (*) or allow all origins in production!');
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    return false;
  }

  return true;
}
