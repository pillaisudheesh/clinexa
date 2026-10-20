import { registerAs } from '@nestjs/config';

const KNOWN_INSECURE_SECRETS = new Set([
  'clinexa-super-secret-key',
  'changethistosomethinglongandrandom',
  'secret',
  'changeme',
  'replace-me',
]);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error(
      'JWT_SECRET is required. Generate a random secret of at least 32 characters and set it in the environment.',
    );
  }

  if (secret.length < 32 || KNOWN_INSECURE_SECRETS.has(secret.toLowerCase())) {
    throw new Error(
      'JWT_SECRET is insecure. Use a unique, randomly generated secret of at least 32 characters.',
    );
  }

  return secret;
}

export default registerAs('jwt', () => ({
  secret: getJwtSecret(),
  expiresIn: process.env.JWT_EXPIRES_IN?.trim() || '1h',
}));
