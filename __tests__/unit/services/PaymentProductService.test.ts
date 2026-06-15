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

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { basePaymentProductJson } from '../../__fixtures__/base-payment-product-json';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';

import { DefaultPaymentProductService } from '../../../src/services/DefaultPaymentProductService';
import { PaymentProduct } from '../../../src';
import { UrlUtil } from '../../../src/infrastructure/utils/UrlUtil';
import { SupportedProductsUtil } from '../../../src/infrastructure/utils/SupportedProductsUtil';
import type { PaymentProductService } from '../../../src/services/interfaces/PaymentProductService';
import { CacheManager } from '../../../src/infrastructure/utils/CacheManager';
import { TestApiClient } from '../testUtils/TestApiClient';
import { DefaultPaymentProductFactory } from '../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import {
  BasicPaymentProducts,
  type PaymentContext,
  ResponseError,
  PaymentProductNetworksResponse,
  type SdkResponse,
} from '../../../src';
import type { BasicPaymentProductsDto } from '../../../src/infrastructure/apiModels/paymentProduct/BasicPaymentProductsDto';
import type { ApplePay } from '../../../src/services/models/ApplePay';

let service: PaymentProductService;
let applePay: ApplePay;

const paymentContext = {
  countryCode: 'NL',
  isRecurring: true,
  amountOfMoney: {
    amount: 100,
    currencyCode: 'EUR',
  },
} as PaymentContext;

const cacheKey = 'cache-key';

let products: BasicPaymentProductsDto;
let paymentProductDto: typeof cardPaymentProductJson;
let paymentProduct: ReturnType<
  DefaultPaymentProductFactory['createPaymentProduct']
>;
let networks: PaymentProductNetworksResponse;

let cacheSpy: Mock<
  ({
    prefix,
    suffix,
    context,
  }: {
    context: PaymentContext;
    prefix: string;
    suffix?: string;
  }) => string
>;

beforeEach(() => {
  products = {
    paymentProducts: [basePaymentProductJson],
  } as BasicPaymentProductsDto;
  paymentProductDto = cardPaymentProductJson;
  paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(
    paymentProductDto
  );
  networks = { networks: ['network'] } as PaymentProductNetworksResponse;

  applePay = {
    isApplePayAvailable: vi.fn().mockResolvedValue(true),
  } as unknown as ApplePay;

  service = new DefaultPaymentProductService(
    new CacheManager(),
    new TestApiClient(),
    new DefaultPaymentProductFactory(),
    applePay
  );

  vi.spyOn(UrlUtil, 'urlWithQueryString').mockReturnValue('https://mocked-url');
  cacheSpy = vi
    .spyOn(CacheManager.prototype, 'createCacheKeyFromContext')
    .mockReturnValue(cacheKey);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getBasicPaymentProducts', () => {
  let basicPaymentProducts: BasicPaymentProducts;
  beforeEach(() => {
    vi.spyOn(
      SupportedProductsUtil,
      'filterOutSdkUnsupportedProducts'
    ).mockImplementation(() => {});

    basicPaymentProducts =
      new DefaultPaymentProductFactory().createBasicPaymentProducts(products);
  });

  it('returns from cache if present', async () => {
    vi.spyOn(
      DefaultPaymentProductFactory.prototype,
      'createBasicPaymentProducts'
    ).mockReturnValue(basicPaymentProducts);

    const cacheHasSpy = vi
      .spyOn(CacheManager.prototype, 'has')
      .mockReturnValue(true);
    const cacheGetSpy = vi
      .spyOn(CacheManager.prototype, 'get')
      .mockReturnValue(basicPaymentProducts);
    const result = await service.getBasicPaymentProducts(paymentContext);

    expect(cacheSpy).toHaveBeenCalledWith({
      context: paymentContext,
      prefix: 'basicPaymentProducts',
    });

    expect(cacheHasSpy).toHaveBeenCalledWith(cacheKey);
    expect(cacheGetSpy).toHaveBeenCalledWith(cacheKey);
    expect(result.paymentProducts).toEqual(
      basicPaymentProducts.paymentProducts
    );
  });

  it('calls api, filters data, caches, and returns on cache miss', async () => {
    const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');
    const apiSpy = getTestApiSpy('getWithContext', products);

    const result = await service.getBasicPaymentProducts(paymentContext);

    expect(apiSpy).toHaveBeenCalledTimes(1);
    expect(
      SupportedProductsUtil.filterOutSdkUnsupportedProducts
    ).toHaveBeenCalledWith(products);
    expect(cacheSetSpy).toHaveBeenCalledWith(cacheKey, basicPaymentProducts);
    expect(result.paymentProducts).toEqual(
      basicPaymentProducts.paymentProducts
    );
  });

  it('throws an error if response is not 2xx codes', async () => {
    const apiSpy = getTestApiSpy(
      'getWithContext',
      {
        success: false,
        data: {
          errorId: '15eabcd5-30b3-479b-ae03-67bb351c07e6-00000092',
          errors: [
            {
              errorCode: 50001130,
              category: 'PAYMENT_PLATFORM_ERROR',
              code: 50001130,
              httpStatusCode: 404,
              id: 'UNKNOWN_PAYMENT_ID',
              message: 'Authorisation declined',
              propertyName: 'paymentId',
              retriable: true,
            },
          ],
        },
        status: 400,
      },
      true
    );

    await expect(
      service.getBasicPaymentProducts(paymentContext)
    ).rejects.toThrow(ResponseError);

    expect(apiSpy).toHaveBeenCalledTimes(1);
  });

  it('throws ResponseError when all products are filtered out after unsupported filtering', async () => {
    const productsClone = {
      ...products,
      paymentProducts: [...products.paymentProducts],
    };
    getTestApiSpy('getWithContext', productsClone);

    vi.mocked(
      SupportedProductsUtil.filterOutSdkUnsupportedProducts
    ).mockImplementation((dto) => {
      if (dto.paymentProducts) dto.paymentProducts = [];
    });

    const promise = service.getBasicPaymentProducts(paymentContext);

    await expect(promise).rejects.toThrow(ResponseError);
  });

  it('filters out Apple Pay product (302) when isApplePayAvailable returns false', async () => {
    const applePayProduct = { id: 302, displayHints: {} };
    const otherProduct = { id: 1, displayHints: {} };
    const productsWithApplePay = {
      paymentProducts: [applePayProduct, otherProduct],
    } as BasicPaymentProductsDto;

    getTestApiSpy('getWithContext', productsWithApplePay);
    vi.mocked(applePay.isApplePayAvailable).mockResolvedValue(false);

    const result = await service.getBasicPaymentProducts(paymentContext);

    // Apple Pay (302) should be filtered out
    expect(result.paymentProducts).toHaveLength(1);
    expect(result.paymentProducts[0]?.id).toBe(1);
    expect(result.paymentProducts.find((p) => p.id === 302)).toBeUndefined();
  });

  it('includes Apple Pay product (302) when isApplePayAvailable returns true', async () => {
    const applePayProduct = { id: 302, displayHints: {} };
    const otherProduct = { id: 1, displayHints: {} };
    const productsWithApplePay = {
      paymentProducts: [applePayProduct, otherProduct],
    } as BasicPaymentProductsDto;

    getTestApiSpy('getWithContext', productsWithApplePay);
    vi.mocked(applePay.isApplePayAvailable).mockResolvedValue(true);

    const result = await service.getBasicPaymentProducts(paymentContext);

    // Apple Pay (302) should be included
    expect(result.paymentProducts).toHaveLength(2);
    expect(result.paymentProducts.find((p) => p.id === 302)).toBeDefined();
  });
});

describe('getPaymentProductNetworks', () => {
  it('returns from cache if present', async () => {
    const cacheHasSpy = vi
      .spyOn(CacheManager.prototype, 'has')
      .mockReturnValue(true);
    const cacheGetSpy = vi
      .spyOn(CacheManager.prototype, 'get')
      .mockReturnValue(networks);

    const apiSpy = getTestApiSpy('getWithContext', {});
    const result = await service.getPaymentProductNetworks(1, paymentContext);

    expect(cacheSpy).toHaveBeenCalledWith({
      context: paymentContext,
      prefix: 'paymentProductNetworks-1',
    });

    expect(cacheHasSpy).toHaveBeenCalledWith(cacheKey);
    expect(cacheGetSpy).toHaveBeenCalledWith(cacheKey);
    expect(apiSpy).not.toHaveBeenCalled();
    expect(result).toBe(networks);
  });

  it('calls api, filters data, caches, and returns on cache miss', async () => {
    const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');
    const apiSpy = getTestApiSpy('getWithContext', networks);

    const result = await service.getPaymentProductNetworks(1, paymentContext);

    expect(apiSpy).toHaveBeenCalledTimes(1);
    expect(cacheSetSpy).toHaveBeenCalledWith(cacheKey, networks);
    expect(result).toBe(networks);
  });

  it('throws ResponseError when response is successful but has no data', async () => {
    getTestApiSpy(
      'getWithContext',
      { success: true, status: 200, data: undefined },
      true
    );

    const promise = service.getPaymentProductNetworks(1, paymentContext);

    await expect(promise).rejects.toThrow(ResponseError);
  });

  it('throws ResponseError when API response is invalid', async () => {
    getTestApiSpy(
      'getWithContext',
      { success: false, status: 400, data: undefined },
      true
    );

    const promise = service.getPaymentProductNetworks(1, paymentContext);

    await expect(promise).rejects.toThrow(ResponseError);
  });
});

describe('getPaymentProduct', () => {
  it('returns from cache if present', async () => {
    vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk').mockReturnValue(true);

    const cacheHasSpy = vi
      .spyOn(CacheManager.prototype, 'has')
      .mockReturnValue(true);
    const cacheGetSpy = vi
      .spyOn(CacheManager.prototype, 'get')
      .mockReturnValue(paymentProduct);
    const apiSpy = getTestApiSpy('getWithContext', {});

    const result = await service.getPaymentProduct(1, paymentContext);

    expect(cacheSpy).toHaveBeenCalledWith({
      context: paymentContext,
      prefix: 'paymentProduct-1',
    });

    expect(cacheHasSpy).toHaveBeenCalledWith(cacheKey);
    expect(cacheGetSpy).toHaveBeenCalledWith(cacheKey);
    expect(apiSpy).not.toHaveBeenCalled();

    expect(result).toBeInstanceOf(PaymentProduct);
    expect(result.id).toBe(1);
    expect(result.getFields().length).toBe(4);
  });

  it('calls api, filters data, caches, and returns on cache miss for payment product', async () => {
    vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk').mockReturnValue(true);

    const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');
    vi.spyOn(
      DefaultPaymentProductFactory.prototype,
      'createPaymentProduct'
    ).mockReturnValue(paymentProduct);
    const apiSpy = getTestApiSpy('getWithContext', paymentProductDto);

    const result = await service.getPaymentProduct(1, paymentContext);

    expect(apiSpy).toHaveBeenCalledTimes(1);
    expect(SupportedProductsUtil.isSupportedInSdk).toHaveBeenCalledWith(1);
    expect(cacheSetSpy).toHaveBeenCalledWith(cacheKey, paymentProduct);
    expect(result).toBeInstanceOf(PaymentProduct);
    expect(result.id).toBe(1);
  });

  it('throws an error if product is not supported', async () => {
    vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk').mockReturnValue(false);

    try {
      await service.getPaymentProduct(1, paymentContext);
      expect.fail('Should throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ResponseError);
      expect((error as ResponseError).metadata).toStrictEqual(
        SupportedProductsUtil.get404Error()
      );
    }
  });

  it('throws ResponseError when API response is invalid', async () => {
    vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk').mockReturnValue(true);

    getTestApiSpy(
      'getWithContext',
      { success: true, status: 200, data: undefined },
      true
    );

    const promise = service.getPaymentProduct(1, paymentContext);

    await expect(promise).rejects.toThrow(ResponseError);
  });
  it('filters out Apple Pay when isApplePayAvailable returns false', async () => {
    applePay = {
      isApplePayAvailable: vi.fn().mockResolvedValue(false),
    } as unknown as ApplePay;

    service = new DefaultPaymentProductService(
      new CacheManager(),
      new TestApiClient(),
      new DefaultPaymentProductFactory(),
      applePay
    );

    vi.spyOn(UrlUtil, 'urlWithQueryString').mockReturnValue(
      'https://mocked-url'
    );
    vi.spyOn(
      CacheManager.prototype,
      'createCacheKeyFromContext'
    ).mockReturnValue(cacheKey);
    vi.spyOn(
      SupportedProductsUtil,
      'filterOutSdkUnsupportedProducts'
    ).mockImplementation(() => {});

    // products containing Apple Pay ID (302) alongside a regular product
    const productsWithApplePay = {
      paymentProducts: [
        basePaymentProductJson,
        {
          ...basePaymentProductJson,
          id: SupportedProductsUtil.applePayPaymentProductId,
        },
      ],
    } as BasicPaymentProductsDto;

    getTestApiSpy('getWithContext', productsWithApplePay);

    const result = await service.getBasicPaymentProducts(paymentContext);

    const ids = result.paymentProducts.map((p) => p.id);
    expect(ids).not.toContain(SupportedProductsUtil.applePayPaymentProductId);
  });

  it('throws ResponseError for Apple Pay product ID when isApplePayAvailable returns false', async () => {
    applePay = {
      isApplePayAvailable: vi.fn().mockResolvedValue(false),
    } as unknown as ApplePay;

    service = new DefaultPaymentProductService(
      new CacheManager(),
      new TestApiClient(),
      new DefaultPaymentProductFactory(),
      applePay
    );

    vi.spyOn(UrlUtil, 'urlWithQueryString').mockReturnValue(
      'https://mocked-url'
    );
    vi.spyOn(
      CacheManager.prototype,
      'createCacheKeyFromContext'
    ).mockReturnValue(cacheKey);
    vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk').mockReturnValue(true);

    await expect(
      service.getPaymentProduct(
        SupportedProductsUtil.applePayPaymentProductId,
        paymentContext
      )
    ).rejects.toBeInstanceOf(ResponseError);
  });
});

function getTestApiSpy<T>(
  method: 'get' | 'getWithContext',
  response: T | SdkResponse<T>,
  fullResponse = false
) {
  return vi
    .spyOn(TestApiClient.prototype, method)
    .mockReturnValue(
      Promise.resolve(
        fullResponse
          ? (response as SdkResponse<T>)
          : { success: true, status: 200, data: response }
      )
    );
}
