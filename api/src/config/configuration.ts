function getPort(): number {
  const rawPort = process.env.PORT?.trim() || '3000';
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

function getCorsOrigins(): string[] {
  const rawOrigins =
    process.env.CORS_ORIGINS?.trim() || 'http://localhost:3001';
  const origins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0 || origins.includes('*')) {
    throw new Error(
      'CORS_ORIGINS must contain explicit origins; wildcard origins are not allowed.',
    );
  }

  return origins;
}

export default () => ({
  app: {
    port: getPort(),
    environment: process.env.NODE_ENV?.trim() || 'development',
    corsOrigins: getCorsOrigins(),
    swaggerEnabled:
      process.env.SWAGGER_ENABLED === 'true' ||
      ((process.env.NODE_ENV?.trim() || 'development') !== 'production' &&
        process.env.SWAGGER_ENABLED !== 'false'),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
});
