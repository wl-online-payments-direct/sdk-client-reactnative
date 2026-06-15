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

import { callNTimes, getApiClientSpyMock } from '../utils';
import { getConfiguration, getSessionDetails } from '../setup';
import { paymentContext } from '../../__fixtures__/payment-context';
import { GOOGLE_PAY_ID } from '../../__fixtures__/payment_ids';
import { init, OnlinePaymentSdk, ResponseError } from '../../../src';

describe('session.getPaymentProductNetworks', () => {
  let session: OnlinePaymentSdk;
  beforeEach(() => {
    session = init(getSessionDetails(), getConfiguration());
  });

  it('should throw a response error when paymentProductId is not correct', async () => {
    try {
      await session.getPaymentProductNetworks(1, paymentContext);
      expect.fail('Should throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ResponseError);

      const metadata = (error as ResponseError).metadata as {
        errors: unknown[];
      };

      expect(metadata.errors).toBeInstanceOf(Array);
      expect(metadata.errors.length).toBeGreaterThan(0);

      const firstError = metadata.errors[0] as Record<string, unknown>;
      expect(firstError).toMatchObject({
        retriable: expect.any(Boolean),
        category: expect.any(String),
        code: expect.any(String),
        httpStatusCode: 400,
      });
    }
  });

  it('should return a list of payment product networks', async () => {
    const paymentProductNetworks = await session.getPaymentProductNetworks(
      GOOGLE_PAY_ID,
      paymentContext
    );
    expect(paymentProductNetworks).toHaveProperty('networks');
    expect(paymentProductNetworks.networks.length).toBeGreaterThan(0);
  });

  it('when called again, should result from cache instead network call', async () => {
    const spy = getApiClientSpyMock('getWithContext', { networks: [] });
    await callNTimes(3, () =>
      session.getPaymentProductNetworks(1, paymentContext)
    );
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
