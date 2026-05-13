/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { publicKeyResponse } from '../../__fixtures__/public-key-response';
import { DefaultEncryptionService } from '../../../src/services/DefaultEncryptionService';
import { CacheManager } from '../../../src/infrastructure/utils/CacheManager';
import { TestApiClient } from '../testUtils/TestApiClient';
import { PublicKeyResponse } from '../../../src';
import { PaymentRequest, CreditCardTokenRequest } from '../../../src';
import { DefaultPaymentProductFactory } from '../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import { Encryptor } from '../../../src/infrastructure/encryption/Encryptor';
import type { DeviceInformationProvider } from '../../../src/infrastructure/interfaces/DeviceInformationProvider';

let service: DefaultEncryptionService;
let encryptor: Encryptor;
let mockDeviceInformationProvider: DeviceInformationProvider;

beforeEach(() => {
  mockDeviceInformationProvider = {
    getMetadata: () => ({
      screenSize: '1080x1920',
      platformIdentifier: 'test-platform',
      sdkIdentifier: 'test-sdk',
      sdkCreator: 'test-creator',
      appIdentifier: 'test-creator',
      deviceBrand: 'Apple',
      deviceType: 'iPhone',
    }),
  };

  encryptor = new Encryptor({
    clientSessionId: 'test-session-id',
  });

  service = new DefaultEncryptionService(
    encryptor,
    mockDeviceInformationProvider,
    new CacheManager(),
    new TestApiClient()
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DefaultEncryptionService (integration)', () => {
  it('encryptPaymentRequest returns encryptedFields', async () => {
    const paymentProduct =
      new DefaultPaymentProductFactory().createPaymentProduct(
        cardPaymentProductJson
      );
    const request = new PaymentRequest(paymentProduct);

    request.setValue('cvv', '123');
    request.setValue('expiryDate', '12/2026');
    request.setValue('cardNumber', '4242424242424242');

    getTestApiSpy();
    const result = await service.encryptPaymentRequest(request);

    expect(result).toHaveProperty('encryptedCustomerInput');
    expect(result.encryptedCustomerInput).toBeDefined();
  });

  it('encryptTokenRequest returns encryptedFields', async () => {
    const token = new CreditCardTokenRequest();

    token.setSecurityCode('123');
    token.setCardNumber('424242424242');
    token.setProductPaymentId(1);

    getTestApiSpy();
    const result = await service.encryptTokenRequest(token);

    expect(result).toHaveProperty('encryptedCustomerInput');
    expect(result.encryptedCustomerInput).toBeDefined();
  });

  it('getPublicKey returns from cache when available', async () => {
    const apiSpy = getTestApiSpy();
    const cacheHasSpy = vi
      .spyOn(CacheManager.prototype, 'has')
      .mockReturnValue(true);
    const cacheGetSpy = vi
      .spyOn(CacheManager.prototype, 'get')
      .mockReturnValue(publicKeyResponse);
    const result = await service.getPublicKey();

    expect(cacheHasSpy).toHaveBeenCalledWith('publicKey');
    expect(cacheGetSpy).toHaveBeenCalledWith('publicKey');
    expect(apiSpy).not.toHaveBeenCalled();
    expect(result).toBe(publicKeyResponse);
  });

  it('getPublicKey fetches from API when not cached', async () => {
    const publicKeyDto: PublicKeyResponse = {
      keyId: 'test-key-id',
      publicKey: 'test-public-key',
    };

    const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

    const apiSpy = getTestApiSpy(publicKeyDto);

    const result = await service.getPublicKey();

    expect(apiSpy).toHaveBeenCalledWith('/crypto/publickey');
    expect(cacheSetSpy).toHaveBeenCalledWith('publicKey', expect.any(Object));
    expect(result).toBeInstanceOf(Object);
    expect(result.keyId).toBe('test-key-id');
  });
});

function getTestApiSpy(publicKeyJson?: PublicKeyResponse) {
  return vi.spyOn(TestApiClient.prototype, 'get').mockReturnValue(
    Promise.resolve({
      success: true,
      status: 200,
      data: publicKeyJson ?? publicKeyResponse,
    })
  );
}
