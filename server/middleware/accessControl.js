// Middleware to block direct browser access
// Only allow requests from app and website

const allowOnlyAppOrWebsite = (req, res, next) => {
  // Get headers
  const apiKey = req.get('X-API-Key');
  const origin = req.get('origin') || req.get('referer');
  const userAgent = req.get('user-agent') || '';

  // Your secret API key (add this to .env file)
  const validApiKey = process.env.CLIENT_API_KEY || 'your-secret-api-key-12345';

  // Allowed origins (your website URLs)
  const allowedOrigins = [
    'http://localhost:8080',      // Development
    'https://service-provider-two-tawny.vercel.app',      // Development alternative
    'https://www.service-provider-two-tawny.vercel.app',      // Development alternative

    'https://www.meragharsansaar.com/',     // Production website
    'https://smeragharsansaar.com/', // Production website with www
  ];

  // Check 1: Valid API Key from app
  if (apiKey && apiKey === validApiKey) {
    return next();
  }

  // Check 2: Request from allowed website origin
  if (origin) {
    const isAllowedOrigin = allowedOrigins.some(allowed =>
      origin.startsWith(allowed)
    );

    if (isAllowedOrigin) {
      return next();
    }
  }

  // Check 3: Mobile app user agents (optional extra check)
  const isMobileApp = userAgent.includes('YourAppName') ||
    userAgent.includes('ReactNative') ||
    userAgent.includes('Capacitor');

  if (isMobileApp && apiKey === validApiKey) {
    return next();
  }


  return res.status(403).json({
    success: false,
    message: 'Direct access not allowed. Please use the official app or website.',
    code: 'ACCESS_DENIED'
  });
};

module.exports = allowOnlyAppOrWebsite;
