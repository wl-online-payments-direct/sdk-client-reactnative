/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import { random as forgeRandom } from 'node-forge';
import { JOSEEncryptor } from '../../../../src/infrastructure/encryption/JOSEEncryptor';
import { PublicKeyResponse } from '../../../../src';
import { publicKeyResponse } from '../../../__fixtures__/public-key-response';

function decodeBase64UrlToJson(segment: string) {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

function expectCompactJwe(token: string, kid: string) {
  const parts = token.split('.');
  expect(parts).toHaveLength(5);
  for (const part of parts) {
    expect(part.length).toBeGreaterThan(0);
    expect(part).toMatch(/^[A-Za-z0-9\-_]+$/);
  }

  const header = decodeBase64UrlToJson(parts[0]!);
  expect(header).toStrictEqual({
    alg: 'RSA-OAEP',
    enc: 'A256CBC-HS512',
    kid,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('JOSEEncryptor.encrypt (SDK contract)', () => {
  it('encrypts realistic payment payload used by SDK', () => {
    const sdkPayload = {
      clientSessionId: 'test-session-id',
      nonce: '0123456789abcdef0123456789abcdef',
      paymentProductId: 1,
      tokenize: true,
      accountOnFileId: '1234',
      paymentValues: [
        { key: 'cardNumber', value: '4567350000427977' },
        { key: 'expiryDate', value: '1230' },
        { key: 'cvv', value: '123' },
      ],
    };

    const encrypted = JOSEEncryptor.encrypt(sdkPayload, publicKeyResponse);
    expectCompactJwe(encrypted, publicKeyResponse.keyId);
  });

  it('supports unicode payload values used in cardholder names', () => {
    const sdkPayload = {
      clientSessionId: 'test-session-id',
      nonce: '0123456789abcdef0123456789abcdef',
      paymentProductId: 1,
      paymentValues: [{ key: 'cardholderName', value: 'Darwin Núñez' }],
    };

    const encrypted = JOSEEncryptor.encrypt(sdkPayload, publicKeyResponse);
    expectCompactJwe(encrypted, publicKeyResponse.keyId);
  });

  it('keeps deterministic header/iv/cipher/tag when random bytes are mocked', () => {
    // Security rationale: This test verifies that JWE encryption is deterministic
    // given fixed random inputs (for CEK and IV). The only non-deterministic part
    // should be the encrypted CEK (ek) because RSA-OAEP uses fresh randomness per encryption.
    // Everything else — IV, ciphertext, authentication tag — is deterministic once
    // the random bytes are fixed. This ensures the encryption implementation is correct
    // and not introducing unexpected entropy that could weaken security.
    vi.spyOn(forgeRandom, 'getBytesSync').mockImplementation((len: number) =>
      'a'.repeat(len)
    );

    const payload = {
      clientSessionId: 's',
      nonce: 'n',
      paymentProductId: 1,
      paymentValues: [{ key: 'k', value: 'v' }],
    };

    const first = JOSEEncryptor.encrypt(payload, publicKeyResponse);
    const second = JOSEEncryptor.encrypt(payload, publicKeyResponse);

    const [h1, ek1, iv1, c1, t1] = first.split('.');
    const [h2, ek2, iv2, c2, t2] = second.split('.');

    expect(h1).toBe(h2);
    expect(iv1).toBe(iv2);
    expect(c1).toBe(c2);
    expect(t1).toBe(t2);
    // ek must differ even with fixed random bytes because RSA-OAEP pads with its own entropy
    expect(ek1).not.toBe(ek2);
  });

  it('throws when public key is malformed', () => {
    const malformed = new PublicKeyResponse('kid', 'not-base64-or-der');
    expect(() => JOSEEncryptor.encrypt({ a: 1 }, malformed)).toThrow(
      /certificate|key|PEM|DER|parse/i
    );
  });

  it('produces unique IVs on each call (freshness)', () => {
    // This test verifies semantic security: each encryption must use a fresh IV
    // to ensure identical plaintexts produce different ciphertexts (IND-CPA security).
    // If IVs were reused, an attacker could detect duplicate card numbers.
    const payload = {
      clientSessionId: 's',
      nonce: 'n',
      paymentProductId: 1,
      paymentValues: [],
    };

    const first = JOSEEncryptor.encrypt(payload, publicKeyResponse);
    const second = JOSEEncryptor.encrypt(payload, publicKeyResponse);

    // IV is the third JWE segment (base64url-encoded 16-byte value → 22 chars)
    const iv1 = first.split('.')[2]!;
    const iv2 = second.split('.')[2]!;

    // IV must differ between calls to ensure semantic security
    expect(iv1).not.toBe(iv2);
  });

  it('IV segment decodes to exactly 16 bytes', () => {
    const payload = {
      clientSessionId: 's',
      nonce: 'n',
      paymentProductId: 1,
      paymentValues: [],
    };

    const token = JOSEEncryptor.encrypt(payload, publicKeyResponse);
    const ivSegment = token.split('.')[2]!;

    // Restore padding and decode
    const padded =
      ivSegment.replace(/-/g, '+').replace(/_/g, '/') +
      '='.repeat((4 - (ivSegment.length % 4)) % 4);
    const ivBytes = Buffer.from(padded, 'base64');

    // IVLENGTH = 128 bits = 16 bytes
    expect(ivBytes.length).toBe(16);
  });

  it('uses CEK of exactly 64 bytes (512 bits) for A256CBC-HS512', () => {
    // A256CBC-HS512 requires a 512-bit CEK: 256 bits for HMAC-SHA512 + 256 bits for AES-256-CBC.
    // This test verifies the CEK length matches the JWE spec for this algorithm.
    const capturedLengths: number[] = [];

    vi.spyOn(forgeRandom, 'getBytesSync').mockImplementation((len: number) => {
      capturedLengths.push(len);
      return 'a'.repeat(len);
    });

    const payload = {
      clientSessionId: 's',
      nonce: 'n',
      paymentProductId: 1,
      paymentValues: [],
    };

    JOSEEncryptor.encrypt(payload, publicKeyResponse);

    // First call to getBytesSync is for CEK, second is for IV
    // CEK should be 64 bytes (512 bits): 32 bytes for HMAC + 32 bytes for AES
    expect(capturedLengths[0]).toBe(64);
    expect(capturedLengths[1]).toBe(16); // IV should be 16 bytes
  });
});
