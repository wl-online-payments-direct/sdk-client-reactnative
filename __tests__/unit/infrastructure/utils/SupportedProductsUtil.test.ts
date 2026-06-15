/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { describe, expect, it } from 'vitest';
import { SupportedProductsUtil } from '../../../../src/infrastructure/utils/SupportedProductsUtil';
import { basePaymentProductJson } from '../../../__fixtures__/base-payment-product-json';

const supportedProduct = { ...basePaymentProductJson, id: 1 };
const applePayProduct = { ...basePaymentProductJson, id: 302 };
const sdkUnsupportedProduct = { ...basePaymentProductJson, id: 117 };

describe('applePayPaymentProductId', () => {
  it('uses 302 as Apple Pay payment product id', () => {
    expect(SupportedProductsUtil.applePayPaymentProductId).toBe(302);
  });
});

describe('isSupportedInSdk', () => {
  it('returns true when the product id is not in the sdk unsupported list', () => {
    expect(SupportedProductsUtil.isSupportedInSdk(1)).toBe(true);
  });

  it('returns true for Apple Pay because availability is handled separately', () => {
    expect(SupportedProductsUtil.isSupportedInSdk(302)).toBe(true);
  });

  it('returns false for known SDK-unsupported product ids', () => {
    expect(SupportedProductsUtil.isSupportedInSdk(117)).toBe(false);
    expect(SupportedProductsUtil.isSupportedInSdk(5700)).toBe(false);
    expect(SupportedProductsUtil.isSupportedInSdk(5772)).toBe(false);
    expect(SupportedProductsUtil.isSupportedInSdk(5784)).toBe(false);
  });
});

describe('filterOutSdkUnsupportedProducts', () => {
  it('removes products from the dto whose id is in the sdk unsupported list', () => {
    const dto = {
      paymentProducts: [sdkUnsupportedProduct, supportedProduct],
    };

    SupportedProductsUtil.filterOutSdkUnsupportedProducts(dto);

    expect(dto.paymentProducts).toHaveLength(1);

    const [remainingProduct] = dto.paymentProducts;

    if (!remainingProduct) {
      throw new Error('Expected one supported payment product.');
    }

    expect(remainingProduct.id).toBe(1);
  });

  it('does not remove Apple Pay because Apple Pay availability is handled separately', () => {
    const dto = {
      paymentProducts: [applePayProduct, supportedProduct],
    };

    SupportedProductsUtil.filterOutSdkUnsupportedProducts(dto);

    expect(dto.paymentProducts).toHaveLength(2);
    expect(dto.paymentProducts.map(({ id }) => id)).toEqual([302, 1]);
  });

  it('does nothing when the dto has no paymentProducts array', () => {
    const dto: { paymentProducts?: (typeof supportedProduct)[] } = {};

    expect(() =>
      SupportedProductsUtil.filterOutSdkUnsupportedProducts(dto)
    ).not.toThrow();
    expect(dto.paymentProducts).toBeUndefined();
  });
});

describe('get404Error', () => {
  it('returns an ErrorResponse with status 404, error code 1007, and property name productId', () => {
    const error = SupportedProductsUtil.get404Error();

    const [firstError] = error.errors;

    if (!firstError) {
      throw new Error('Expected one 404 error entry.');
    }

    expect(firstError.httpStatusCode).toBe(404);
    expect(firstError.errorCode).toBe('1007');
    expect(firstError.propertyName).toBe('productId');
  });
});
