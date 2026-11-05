import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/crypto';

describe('Authentication & Password Hashing', () => {
  it('should correctly hash and verify matching password', () => {
    const password = 'mypassword123';
    const { hash, salt } = hashPassword(password);

    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(verifyPassword(password, hash, salt)).toBe(true);
  });

  it('should reject incorrect password', () => {
    const password = 'correct-password';
    const { hash, salt } = hashPassword(password);

    expect(verifyPassword('wrong-password', hash, salt)).toBe(false);
  });

  it('should produce unique salts and hashes for the same password', () => {
    const password = 'same-password';
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);

    expect(hash1.salt).not.toBe(hash2.salt);
    expect(hash1.hash).not.toBe(hash2.hash);
  });
});
