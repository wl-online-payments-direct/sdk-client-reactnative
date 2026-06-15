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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import type { PaymentContext, SdkResponse } from '../../../src';
import { DefaultApiClient } from '../../../src/infrastructure/DefaultApiClient';
import { ApiVersion } from '../../../src/infrastructure/models/ApiVersion';
import { CommunicationError } from '../../../src';
import type { Metadata } from '../../../src/infrastructure/encryption/types';
import type { DeviceInformationProvider } from '../../../src/infrastructure/interfaces/DeviceInformationProvider';

describe('ApiClient', () => {
  let apiClient: DefaultApiClient;
  let fetchMock: ReturnType<typeof vi.fn>;
  let deviceInformationProvider: DeviceInformationProvider;

  const paymentContext: PaymentContext = {
    countryCode: 'US',
    amountOfMoney: {
      amount: 1000,
      currencyCode: 'USD',
    },
    isRecurring: false,
  };

  const metadata: Metadata = {
    sdkCreator: 'test-creator',
    sdkIdentifier: 'test-identifier',
    platformIdentifier: 'test-platform-identifier',
    screenSize: '1200x900',
    appIdentifier: 'test-app',
    deviceBrand: 'test-device-brand',
    deviceType: 'test-device-type',
  };

  beforeEach(() => {
    deviceInformationProvider = {
      getMetadata: vi.fn().mockReturnValue(metadata),
    } as unknown as DeviceInformationProvider;

    apiClient = new DefaultApiClient(
      'https://api.test.com',
      'customer123',
      'session456',
      deviceInformationProvider
    );

    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('should handle GET requests', async () => {
    const mockData = { ...cardPaymentProductJson };
    const expectedUrl = 'https://api.test.com/v1/customer123/crypto/publickey';

    fetchMock.mockResolvedValueOnce(createJsonResponse(mockData));

    const result: SdkResponse<typeof cardPaymentProductJson> =
      await apiClient.get('/crypto/publickey');

    expect(fetchMock).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'X-GCS-ClientMetaInfo': expect.any(String),
          'Authorization': 'GCS v1Client:session456',
        }),
      })
    );

    expect(result.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(cardPaymentProductJson);
  });

  it('should handle POST requests', async () => {
    const mockData = { success: true };
    const expectedUrl = 'https://api.test.com/v1/customer123/create';

    fetchMock.mockResolvedValueOnce(createJsonResponse(mockData, 201));

    const result = await apiClient.post('/create', {
      body: JSON.stringify({ data: 'test' }),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: expect.objectContaining({
          'X-GCS-ClientMetaInfo': expect.any(String),
          'Authorization': 'GCS v1Client:session456',
        }),
      })
    );

    expect(result.status).toBe(201);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
  });

  it('should handle GET with context', async () => {
    const mockData = { products: [] };
    const expectedUrl =
      'https://api.test.com/v1/customer123/products?countryCode=US&isRecurring=false&amount=1000&currencyCode=USD';

    fetchMock.mockResolvedValueOnce(createJsonResponse(mockData));

    const result = await apiClient.getWithContext('products', paymentContext);

    expect(fetchMock).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({ method: 'GET' })
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
  });

  it('should handle POST with context', async () => {
    const mockData = { paymentId: '123' };
    const postData = { cardNumber: '4111111111111111' };
    const expectedUrl =
      'https://api.test.com/v1/customer123/payments?countryCode=US&isRecurring=false&amount=1000&currencyCode=USD';

    fetchMock.mockResolvedValueOnce(createJsonResponse(mockData, 201));

    const result = await apiClient.postWithContext('payments', paymentContext, {
      body: JSON.stringify(postData),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postData),
        headers: expect.objectContaining({
          Authorization: 'GCS v1Client:session456',
        }),
      })
    );

    expect(result.status).toBe(201);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
  });

  it('get throws CommunicationError when response is not JSON', async () => {
    fetchMock.mockResolvedValueOnce(createTextResponse('Not Found', 404));

    const error = await apiClient.get('/some-path').catch((e) => e);

    expect(error).toBeInstanceOf(CommunicationError);
    expect(error.httpStatusCode).toBe(404);
    expect(error.response).toBe('Not Found');
  });

  it('post throws CommunicationError when response is not JSON', async () => {
    fetchMock.mockResolvedValueOnce(
      createTextResponse('Internal Server Error', 500)
    );

    const error = await apiClient.post('/some-path').catch((e) => e);

    expect(error).toBeInstanceOf(CommunicationError);
    expect(error.httpStatusCode).toBe(500);
    expect(error.response).toBe('Internal Server Error');
  });

  it('get returns success when response status is 304', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({}, 304, false));

    const result = await apiClient.get('/some-path');

    expect(result.success).toBe(true);
    expect(result.status).toBe(304);
  });

  it('getRequestHeaders returns authorization and client meta info', () => {
    const headers = apiClient.getRequestHeaders() as Record<string, string>;

    expect(headers.Authorization).toBe('GCS v1Client:session456');
    expect(headers['X-GCS-ClientMetaInfo']).toBeDefined();
    expect(typeof headers['X-GCS-ClientMetaInfo']).toBe('string');
  });

  it('getWithContext adds cacheBust query param when cache buster is enabled', async () => {
    const FROZEN_TIME = 1_700_000_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_TIME);

    fetchMock.mockResolvedValueOnce(createJsonResponse({}));

    await apiClient.getWithContext('products', paymentContext, {
      useCacheBuster: true,
    });

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain(`cacheBust=${FROZEN_TIME}`);

    vi.useRealTimers();
  });

  it('getWithContext appends additional query params to URL', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({}));

    await apiClient.getWithContext('products', paymentContext, {
      queryParams: { paymentProductId: 1 },
    });

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('paymentProductId=1');
  });

  it('getWithContext uses provided API version', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({}));

    await apiClient.getWithContext(
      'products',
      paymentContext,
      {},
      ApiVersion.V2
    );

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('/v2/');
  });

  it('get throws CommunicationError when fetch rejects (network failure)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const error = await apiClient.get('/some-path').catch((e) => e);

    expect(error).toBeInstanceOf(CommunicationError);
    expect(error.httpStatusCode).toBe(0);
    expect(error.response).toContain('Network error');
  });

  it('get returns success when status is 0 and response has data', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ ok: true }, 0, false));

    const result = await apiClient.get('/some-path');

    expect(result.success).toBe(true);
    expect(result.status).toBe(0);
  });

  it('get includes custom headers when options.headers provided', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({}));

    await apiClient.get('/some-path', {
      headers: { 'X-Custom-Header': 'custom-value' },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom-Header': 'custom-value',
          'Authorization': 'GCS v1Client:session456',
        }),
      })
    );
  });

  it('uses constructor-level apiVersion for GET requests', async () => {
    const clientWithV2 = new DefaultApiClient(
      'https://api.test.com',
      'customer123',
      'session456',
      deviceInformationProvider,
      ApiVersion.V2
    );
    fetchMock.mockResolvedValueOnce(createJsonResponse({}));

    await clientWithV2.get('/products');

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('/v2/');
  });
});

function createJsonResponse(data: unknown, status = 200, ok = true) {
  return {
    ok,
    status,
    headers: { get: vi.fn().mockReturnValue('application/json') },
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn(),
  };
}

function createTextResponse(text: string, status = 400, ok = false) {
  return {
    ok,
    status,
    headers: { get: vi.fn().mockReturnValue('text/html') },
    json: vi.fn(),
    text: vi.fn().mockResolvedValue(text),
  };
}
