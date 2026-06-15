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

import { getEnvVar } from '../utils';
import {
  type SurchargeCalculationResponse,
  SurchargeResult,
} from '../../../src';

export function getSurchargeCalculationFixtures() {
  // Lazy evaluation - only called when test runs, not at module scope
  const productIdWithSurcharge = () =>
    getEnvVar('VITE_PRODUCT_ID_WITH_SURCHARGE_CURRENCY_CONVERSION');
  const productIdWithoutSurcharge = () =>
    getEnvVar('VITE_PRODUCT_ID_WITHOUT_SURCHARGE_CURRENCY_CONVERSION');
  const productTypeId = () =>
    getEnvVar('VITE_PRODUCT_TYPE_ID_SURCHARGE_CURRENCY_CONVERSION');
  const productTypeVersion = () =>
    getEnvVar('VITE_PRODUCT_TYPE_VERSION_SURCHARGE_CURRENCY_CONVERSION');

  const withSurchargeCalculationResponse: SurchargeCalculationResponse = {
    surcharges: [
      {
        paymentProductId: parseInt(productIdWithSurcharge(), 10),
        result: SurchargeResult.OK,
        netAmount: {
          amount: 1000,
          currencyCode: 'EUR',
        },
        surchargeAmount: {
          amount: 366,
          currencyCode: 'EUR',
        },
        totalAmount: {
          amount: 1366,
          currencyCode: 'EUR',
        },
        surchargeRate: {
          surchargeProductTypeId: productTypeId(),
          surchargeProductTypeVersion: productTypeVersion(),
          adValoremRate: 3.3,
          specificRate: 333,
        },
      },
    ],
  };

  const withNoSurchargeCalculationResponse: SurchargeCalculationResponse = {
    surcharges: [
      {
        paymentProductId: parseInt(productIdWithoutSurcharge(), 10),
        result: SurchargeResult.NO_SURCHARGE,
        netAmount: {
          amount: 1000,
          currencyCode: 'EUR',
        },
        surchargeAmount: {
          amount: 0,
          currencyCode: 'EUR',
        },
        totalAmount: {
          amount: 1000,
          currencyCode: 'EUR',
        },
      },
    ],
  };

  return {
    withSurchargeCalculationResponse,
    withNoSurchargeCalculationResponse,
  };
}
