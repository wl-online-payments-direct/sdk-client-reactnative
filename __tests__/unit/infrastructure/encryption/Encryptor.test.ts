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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cardPaymentProductJson } from '../../../__fixtures__/payment-product-json';
import { cardNumberFieldJson } from '../../../__fixtures__/payment-product-field-json';
import { publicKeyResponse } from '../../../__fixtures__/public-key-response';
import { accountOnFileJson } from '../../../__fixtures__/account-on-file-json';
import { Encryptor } from '../../../../src/infrastructure/encryption/Encryptor';
import { JOSEEncryptor } from '../../../../src/infrastructure/encryption/JOSEEncryptor';
import { DefaultPaymentProductFactory } from '../../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import {
  CreditCardTokenRequest,
  EncryptionError,
  PaymentRequest,
} from '../../../../src';

const paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct({
  ...cardPaymentProductJson,
  fields: [cardNumberFieldJson],
});

const encryptor = new Encryptor({
  clientSessionId: 'test-session-id',
});

afterEach(() => {
  vi.restoreAllMocks();
});

function assertCompactJweHeader(encryptedString: string) {
  const parts = encryptedString.split('.');
  expect(parts).toHaveLength(5);

  const header = JSON.parse(Buffer.from(parts[0]!, 'base64').toString());
  expect(header).toStrictEqual({
    alg: 'RSA-OAEP',
    enc: 'A256CBC-HS512',
    kid: publicKeyResponse.keyId,
  });
}

describe('Encryptor.encrypt', () => {
  let request: PaymentRequest;

  beforeEach(() => {
    request = new PaymentRequest(paymentProduct);
  });

  it('returns a compact JWE when request is valid', () => {
    request.setValue(cardNumberFieldJson.id, '4567350000427977');

    const encrypted = encryptor.encrypt(publicKeyResponse, request);
    assertCompactJweHeader(encrypted);
  });

  it('passes expected payload to JOSEEncryptor.encrypt', () => {
    request.setTokenize(true);
    request.setValue(cardNumberFieldJson.id, '4567350000427977');

    const joseSpy = vi
      .spyOn(JOSEEncryptor, 'encrypt')
      .mockReturnValue('mock.encrypted.value');

    const encrypted = encryptor.encrypt(publicKeyResponse, request);

    expect(encrypted).toBe('mock.encrypted.value');
    expect(joseSpy).toHaveBeenCalledTimes(1);

    const [payload, key] = joseSpy.mock.calls[0]!;
    expect(key).toBe(publicKeyResponse);

    expect(payload).toMatchObject({
      clientSessionId: 'test-session-id',
      paymentProductId: paymentProduct.id,
      tokenize: true,
      paymentValues: [
        { key: cardNumberFieldJson.id, value: '4567350000427977' },
      ],
    });

    expect((payload as { nonce: string }).nonce).toMatch(/^[0-9a-f]{32}$/);
  });

  it('includes accountOnFileId when account-on-file is set', () => {
    const aof = new DefaultPaymentProductFactory().createAccountOnFile(
      accountOnFileJson
    );
    request = new PaymentRequest(paymentProduct, aof);

    const joseSpy = vi
      .spyOn(JOSEEncryptor, 'encrypt')
      .mockReturnValue('mock.encrypted.value');

    encryptor.encrypt(publicKeyResponse, request);

    const [payload] = joseSpy.mock.calls[0]!;
    expect((payload as { accountOnFileId?: string }).accountOnFileId).toBe(
      accountOnFileJson.id
    );
  });

  it('does not include accountOnFileId when no account-on-file is set', () => {
    request.setValue(cardNumberFieldJson.id, '4567350000427977');

    const joseSpy = vi
      .spyOn(JOSEEncryptor, 'encrypt')
      .mockReturnValue('mock.encrypted.value');

    encryptor.encrypt(publicKeyResponse, request);

    const [payload] = joseSpy.mock.calls[0]!;
    expect(payload).not.toHaveProperty('accountOnFileId');
  });

  it('throws EncryptionError when paymentProductId is missing', () => {
    vi.spyOn(request, 'getPaymentProductId').mockReturnValue(
      undefined as never
    );

    expect(() => encryptor.encrypt(publicKeyResponse, request)).toThrow(
      EncryptionError
    );
    expect(() => encryptor.encrypt(publicKeyResponse, request)).toThrow(
      'Error encrypting payment request: the payment product ID is not set.'
    );
  });
});

describe('Encryptor.encryptTokenRequest', () => {
  let tokenRequest: CreditCardTokenRequest;

  beforeEach(() => {
    tokenRequest = new CreditCardTokenRequest();
  });

  it('returns a compact JWE when token request is valid', () => {
    tokenRequest.setCardholderName('Darwin Núñez');
    tokenRequest.setCardNumber('4242424242424242');
    tokenRequest.setExpiryDate('1230');
    tokenRequest.setSecurityCode('123');
    tokenRequest.setProductPaymentId(paymentProduct.id);

    const encrypted = encryptor.encryptTokenRequest(
      publicKeyResponse,
      tokenRequest
    );

    assertCompactJweHeader(encrypted);
  });

  it('passes expected payload to JOSEEncryptor.encrypt', () => {
    tokenRequest.setCardNumber('4242424242424242');
    tokenRequest.setProductPaymentId(1);

    const joseSpy = vi
      .spyOn(JOSEEncryptor, 'encrypt')
      .mockReturnValue('mock.encrypted.value');

    const encrypted = encryptor.encryptTokenRequest(
      publicKeyResponse,
      tokenRequest
    );

    expect(encrypted).toBe('mock.encrypted.value');

    const [payload, key] = joseSpy.mock.calls[0]!;
    expect(key).toBe(publicKeyResponse);
    expect(payload).toMatchObject({
      clientSessionId: 'test-session-id',
      paymentProductId: 1,
    });

    // Important: mapValues removes undefined values and stringifies numbers.
    expect(
      (payload as { paymentValues: Array<{ key: string; value: string }> })
        .paymentValues
    ).toEqual(
      expect.arrayContaining([
        { key: 'cardNumber', value: '4242424242424242' },
        { key: 'paymentProductId', value: '1' },
      ])
    );

    expect(
      (payload as { paymentValues: Array<{ key: string }> }).paymentValues
    ).toHaveLength(2);
    expect((payload as { nonce: string }).nonce).toMatch(/^[0-9a-f]{32}$/);
  });

  it('keeps empty string values (only undefined is filtered out)', () => {
    tokenRequest.setCardNumber('4242424242424242');
    tokenRequest.setSecurityCode('');
    tokenRequest.setProductPaymentId(1);

    const joseSpy = vi
      .spyOn(JOSEEncryptor, 'encrypt')
      .mockReturnValue('mock.encrypted.value');

    encryptor.encryptTokenRequest(publicKeyResponse, tokenRequest);

    const [payload] = joseSpy.mock.calls[0]!;
    expect(
      (payload as { paymentValues: Array<{ key: string; value: string }> })
        .paymentValues
    ).toEqual(
      expect.arrayContaining([
        { key: 'cardNumber', value: '4242424242424242' },
        { key: 'cvv', value: '' },
        { key: 'paymentProductId', value: '1' },
      ])
    );
  });

  it('throws EncryptionError when paymentProductId is missing', () => {
    tokenRequest.setCardNumber('4242424242424242');

    expect(() =>
      encryptor.encryptTokenRequest(publicKeyResponse, tokenRequest)
    ).toThrow(EncryptionError);
    expect(() =>
      encryptor.encryptTokenRequest(publicKeyResponse, tokenRequest)
    ).toThrow(
      'Error encrypting credit card token request: the payment product ID is not set.'
    );
  });
});
