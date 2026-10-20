import jwtConfig from './jwt.config';

describe('JWT configuration', () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it('rejects a missing secret', () => {
    delete process.env.JWT_SECRET;

    expect(() => jwtConfig()).toThrow('JWT_SECRET is required');
  });

  it('rejects known insecure or short secrets', () => {
    process.env.JWT_SECRET = 'ChangeThisToSomethingLongAndRandom';
    expect(() => jwtConfig()).toThrow('JWT_SECRET is insecure');

    process.env.JWT_SECRET = 'too-short';
    expect(() => jwtConfig()).toThrow('JWT_SECRET is insecure');
  });

  it('accepts a unique secret of at least 32 characters', () => {
    const secret = 'm9uN6vX2qP8rT4wY7kL3aB5cD1eF0gH6';
    process.env.JWT_SECRET = secret;

    expect(jwtConfig().secret).toBe(secret);
  });
});
