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
import { mock } from 'vitest-mock-extended';
import type { MockProxy } from 'vitest-mock-extended';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { publicKeyResponse } from '../../__fixtures__/public-key-response';
import { DefaultEncryptionService } from '../../../src/services/DefaultEncryptionService';
import { PaymentRequest, CreditCardTokenRequest } from '../../../src';
import { CacheManager } from '../../../src/infrastructure/utils/CacheManager';
import { TestApiClient } from '../testUtils/TestApiClient';
import { PublicKeyResponse, ResponseError } from '../../../src';
import { DefaultPaymentProductFactory } from '../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import type { EncryptionProvider } from '../../../src/infrastructure/encryption/EncryptionProvider';
import type { DeviceInformationProvider } from '../../../src/infrastructure/interfaces/DeviceInformationProvider';
import type { Metadata } from '../../../src/infrastructure/encryption/types';

let service: DefaultEncryptionService;
let deviceInformationProvider: MockProxy<DeviceInformationProvider>;
let encryptionProvider: MockProxy<EncryptionProvider>;

const mockMetadata: Metadata = {
  screenSize: '360x640',
  platformIdentifier: 'android/10',
  sdkIdentifier: 'ReactNativeSdk/test',
  sdkCreator: 'Online-Payments',
  appIdentifier: 'test-app',
  deviceBrand: 'TestBrand',
  deviceType: 'TestDevice',
};

beforeEach(() => {
  deviceInformationProvider = mock<DeviceInformationProvider>();
  deviceInformationProvider.getMetadata.mockReturnValue(mockMetadata);

  encryptionProvider = mock<EncryptionProvider>();
  encryptionProvider.encrypt.mockReturnValue('mock.encrypted.jwe.token.value');
  encryptionProvider.encryptTokenRequest.mockReturnValue(
    'mock.encrypted.jwe.token.value'
  );

  service = new DefaultEncryptionService(
    encryptionProvider,
    deviceInformationProvider,
    new CacheManager(),
    new TestApiClient()
  );
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('DefaultEncryptionService', () => {
  const createValidPaymentRequest = () => {
    const paymentProduct =
      new DefaultPaymentProductFactory().createPaymentProduct(
        cardPaymentProductJson
      );
    const request = new PaymentRequest(paymentProduct);
    request.setValue('cvv', '123');
    request.setValue('expiryDate', '12/2026');
    request.setValue('cardNumber', '4242424242424242');
    return request;
  };

  const createValidTokenRequest = () => {
    const token = new CreditCardTokenRequest();
    token.setSecurityCode('123');
    token.setCardNumber('424242424242');
    token.setProductPaymentId(1);
    return token;
  };

  it('encryptPaymentRequest returns encrypted customer input', async () => {
    const request = createValidPaymentRequest();

    getTestApiSpy();

    const result = await service.encryptPaymentRequest(request);

    expect(result).toHaveProperty('encryptedCustomerInput');
    expect(result.encryptedCustomerInput).toBeDefined();
  });

  it('encryptTokenRequest returns encrypted customer input', async () => {
    const token = createValidTokenRequest();

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

  it('getPublicKey throws ResponseError when API response is invalid', async () => {
    vi.spyOn(TestApiClient.prototype, 'get').mockResolvedValue({
      success: false,
      status: 400,
      data: undefined,
    });

    const promise = service.getPublicKey();

    await expect(promise).rejects.toThrow(ResponseError);
  });

  it('encryptPaymentRequest returns encodedClientMetaInfo', async () => {
    const request = createValidPaymentRequest();
    getTestApiSpy();

    const result = await service.encryptPaymentRequest(request);

    expect(result.encodedClientMetaInfo).toBeDefined();
    expect(result.encodedClientMetaInfo).toBeTruthy();
  });

  it('encryptPaymentRequest uses encryptionProvider.encrypt when request is a PaymentRequest', async () => {
    const request = createValidPaymentRequest();
    getTestApiSpy();

    await service.encryptPaymentRequest(request);

    expect(encryptionProvider.encrypt).toHaveBeenCalledWith(
      publicKeyResponse,
      request
    );
    expect(encryptionProvider.encryptTokenRequest).not.toHaveBeenCalled();
  });

  it('encryptTokenRequest returns encodedClientMetaInfo', async () => {
    const token = createValidTokenRequest();
    getTestApiSpy();

    const result = await service.encryptTokenRequest(token);

    expect(result.encodedClientMetaInfo).toBeDefined();
    expect(result.encodedClientMetaInfo).toBeTruthy();
  });

  it('encryptTokenRequest uses encryptionProvider.encryptTokenRequest when request is a CreditCardTokenRequest', async () => {
    const token = createValidTokenRequest();
    getTestApiSpy();

    await service.encryptTokenRequest(token);

    expect(encryptionProvider.encryptTokenRequest).toHaveBeenCalledWith(
      publicKeyResponse,
      token
    );
    expect(encryptionProvider.encrypt).not.toHaveBeenCalled();
  });
});

function getTestApiSpy(publicKeyJson: PublicKeyResponse = publicKeyResponse) {
  return vi.spyOn(TestApiClient.prototype, 'get').mockResolvedValue({
    success: true,
    status: 200,
    data: publicKeyJson,
  });
}
