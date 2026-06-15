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

import { beforeEach, describe, expect, it } from 'vitest';

import { paymentContext } from '../../__fixtures__/payment-context';
import { callNTimes, getApiClientSpyMock } from '../utils';
import { getConfiguration, getSessionDetails } from '../setup';
import { OnlinePaymentSdk, PaymentProduct } from '../../../src';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { accountOnFileJson } from '../../__fixtures__/account-on-file-json';
import { init, ResponseError } from '../../../src';
import { SupportedProductsUtil } from '../../../src/infrastructure/utils/SupportedProductsUtil';

describe('session.getPaymentProduct', () => {
  let session: OnlinePaymentSdk;

  beforeEach(() => {
    session = init(getSessionDetails(), getConfiguration());
  });

  it('response success; should be an instance of `paymentProduct`', async () => {
    const response = await session.getPaymentProduct(
      cardPaymentProductJson.id,
      paymentContext
    );
    expect(response).toBeInstanceOf(PaymentProduct);
  });

  it('response failed; (invalid data)', async () => {
    await expect(
      session.getPaymentProduct(99999, paymentContext)
    ).rejects.toThrow(ResponseError);
  });

  it('should throw a correct object, when called with unsupported IDs', async () => {
    const unsupportedMethodIds = SupportedProductsUtil.sdkUnsupportedProducts;

    for (const id of unsupportedMethodIds) {
      await expect404Error(id);
    }
  });

  it('when called again, should result from cache instead network call', async () => {
    const spy = getApiClientSpyMock('getWithContext', cardPaymentProductJson);
    await callNTimes(3, () =>
      session.getPaymentProduct(cardPaymentProductJson.id, paymentContext)
    );
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it('response success; should return payment product fields', async () => {
    const spy = getApiClientSpyMock('getWithContext', cardPaymentProductJson);
    const response = await session.getPaymentProduct(
      cardPaymentProductJson.id,
      paymentContext
    );

    expect(response.fields).toHaveLength(cardPaymentProductJson.fields.length);
    expect(response.fields.map((field) => field.id).sort()).toEqual(
      cardPaymentProductJson.fields.map((field) => field.id).sort()
    );

    spy.mockRestore();
  });

  it('response success; should return mapped accounts on file', async () => {
    const productWithAof = {
      ...cardPaymentProductJson,
      accountsOnFile: [accountOnFileJson],
    };
    const spy = getApiClientSpyMock('getWithContext', productWithAof);
    const response = await session.getPaymentProduct(
      cardPaymentProductJson.id,
      paymentContext
    );

    expect(response.accountsOnFile).toHaveLength(
      productWithAof.accountsOnFile.length
    );

    const [accountOnFile] = response.accountsOnFile;

    if (!accountOnFile) {
      throw new Error('Expected one account on file.');
    }

    expect(accountOnFile.id).toBe(accountOnFileJson.id);
    expect(accountOnFile.paymentProductId).toBe(
      accountOnFileJson.paymentProductId
    );

    spy.mockRestore();
  });

  const expect404Error = async (id: number) => {
    await expect(
      session.getPaymentProduct(id, paymentContext)
    ).rejects.toSatisfy((error) => {
      if (!(error instanceof ResponseError)) return false;
      const meta = error.metadata as ErrorResponse;
      return (
        Array.isArray(meta?.errors) &&
        meta.errors.some((e) => e.httpStatusCode === 404)
      );
    });
  };
});
