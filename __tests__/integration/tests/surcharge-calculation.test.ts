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

import { beforeAll, describe, expect, it } from 'vitest';

import {
  callNTimes,
  createSdkClient,
  getApiClientSpyMock,
  getEnvVar,
  getSessionFromSdk,
} from '../utils';
import type { AmountOfMoney, PartialCard } from '../../../src';
import { init, OnlinePaymentSdk, SurchargeResult } from '../../../src';
import { getConfiguration } from '../setup';

// @todo: un-skip this test suite, once the merchant has been configured to support surcharge
describe.skip('session.getSurchargeCalculation', () => {
  let session: OnlinePaymentSdk;
  let partialCreditCardNumberWithSurcharge: string;
  let cardWithSurchargeToken: string;
  let partialCreditCardNumberWithNoSurcharge: string;
  let productIdWithSurcharge: string;
  let productIdWithoutSurcharge: string;

  const amountOfMoney: AmountOfMoney = {
    amount: 1000,
    currencyCode: 'EUR',
  };

  beforeAll(async () => {
    partialCreditCardNumberWithSurcharge = getEnvVar(
      'VITE_PARTIAL_CREDIT_CARD_NUMBER_WITH_SURCHARGE_CURRENCY_CONVERSION'
    );
    cardWithSurchargeToken = getEnvVar(
      'VITE_CARD_TOKEN_WITH_SURCHARGE_CURRENCY_CONVERSION'
    );
    partialCreditCardNumberWithNoSurcharge = getEnvVar(
      'VITE_PARTIAL_CREDIT_CARD_NUMBER_WITHOUT_SURCHARGE_CURRENCY_CONVERSION'
    );
    productIdWithSurcharge = getEnvVar(
      'VITE_PRODUCT_ID_WITH_SURCHARGE_CURRENCY_CONVERSION'
    );
    productIdWithoutSurcharge = getEnvVar(
      'VITE_PRODUCT_ID_WITHOUT_SURCHARGE_CURRENCY_CONVERSION'
    );

    const client = createSdkClient({
      apiKeyId: getEnvVar('VITE_MERCHANT_KEY_SURCHARGE_CURRENCY_CONVERSION'),
      secretApiKey: getEnvVar(
        'VITE_MERCHANT_SECRET_KEY_SURCHARGE_CURRENCY_CONVERSION'
      ),
    });
    const sessionDetails = await getSessionFromSdk({
      client,
      merchantId: getEnvVar('VITE_MERCHANT_SURCHARGE_CURRENCY_CONVERSION'),
    });
    session = init(sessionDetails, getConfiguration());
  });

  it('success with surcharge with provided card with payment product id', async () => {
    const partialCard: PartialCard = {
      partialCreditCardNumber: partialCreditCardNumberWithSurcharge,
      paymentProductId: parseInt(productIdWithSurcharge, 10),
    };
    const result = await session.getSurchargeCalculation(
      amountOfMoney,
      partialCard
    );
    expect(result.surcharges).toHaveLength(1);
    expect(result.surcharges[0]).toMatchObject({
      paymentProductId: parseInt(productIdWithSurcharge, 10),
      result: SurchargeResult.OK,
      netAmount: { amount: 1000, currencyCode: 'EUR' },
      surchargeAmount: expect.objectContaining({ currencyCode: 'EUR' }),
      totalAmount: expect.objectContaining({ currencyCode: 'EUR' }),
    });
  });

  it('success with surcharge with provided card without payment product id', async () => {
    const partialCard: PartialCard = {
      partialCreditCardNumber: partialCreditCardNumberWithSurcharge,
    };
    const result = await session.getSurchargeCalculation(
      amountOfMoney,
      partialCard
    );
    expect(result.surcharges).toHaveLength(1);
    expect(result.surcharges[0]).toMatchObject({
      result: SurchargeResult.OK,
      netAmount: { amount: 1000, currencyCode: 'EUR' },
      surchargeAmount: expect.objectContaining({ currencyCode: 'EUR' }),
      totalAmount: expect.objectContaining({ currencyCode: 'EUR' }),
    });
  });

  it('success with surcharge with provided token', async () => {
    const result = await session.getSurchargeCalculation(
      amountOfMoney,
      cardWithSurchargeToken
    );
    expect(result.surcharges).toHaveLength(1);
    expect(result.surcharges[0]).toMatchObject({
      result: SurchargeResult.OK,
      netAmount: { amount: 1000, currencyCode: 'EUR' },
      surchargeAmount: expect.objectContaining({ currencyCode: 'EUR' }),
      totalAmount: expect.objectContaining({ currencyCode: 'EUR' }),
    });
  });

  it('success with no surcharge with provided card with payment product id', async () => {
    const partialCard: PartialCard = {
      partialCreditCardNumber: partialCreditCardNumberWithNoSurcharge,
      paymentProductId: parseInt(productIdWithoutSurcharge, 10),
    };
    const result = await session.getSurchargeCalculation(
      amountOfMoney,
      partialCard
    );
    expect(result.surcharges).toHaveLength(1);
    expect(result.surcharges[0]).toMatchObject({
      paymentProductId: parseInt(productIdWithoutSurcharge, 10),
      result: SurchargeResult.NO_SURCHARGE,
      netAmount: { amount: 1000, currencyCode: 'EUR' },
      surchargeAmount: expect.objectContaining({ currencyCode: 'EUR' }),
      totalAmount: expect.objectContaining({ currencyCode: 'EUR' }),
    });
  });

  it('success with no surcharge with provided card without payment product id', async () => {
    const partialCard: PartialCard = {
      partialCreditCardNumber: partialCreditCardNumberWithNoSurcharge,
    };
    const result = await session.getSurchargeCalculation(
      amountOfMoney,
      partialCard
    );
    expect(result.surcharges).toHaveLength(1);
    expect(result.surcharges[0]).toMatchObject({
      result: SurchargeResult.NO_SURCHARGE,
      netAmount: { amount: 1000, currencyCode: 'EUR' },
      surchargeAmount: expect.objectContaining({ currencyCode: 'EUR' }),
      totalAmount: expect.objectContaining({ currencyCode: 'EUR' }),
    });
  });

  it('when called again, should result from cache instead network call', async () => {
    const amountOfMoneySpyTest: AmountOfMoney = {
      amount: 1100,
      currencyCode: 'EUR',
    };
    const spy = getApiClientSpyMock('post', {
      withSurchargeCalculationResponse,
    });
    await callNTimes(3, () =>
      session.getSurchargeCalculation(
        amountOfMoneySpyTest,
        cardWithSurchargeToken
      )
    );
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
