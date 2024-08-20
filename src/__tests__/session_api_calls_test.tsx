/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2024 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import {
  BasicPaymentProductsListener,
  CurrencyConversionQuoteListener,
  IinDetailsListener,
  PaymentProductListener,
  PaymentProductNetworksListener,
  PaymentRequestPreparedListener,
  PublicKeyListener,
  SurchargeCalculationListener,
} from '../listeners';
import {
  PaymentRequest,
  PaymentProductField,
  type PaymentProductDisplayHints,
  PaymentProduct,
} from '../models';
import {
  type IinDetailsRequest,
  type PaymentProductRequest,
  type PaymentProductNetworksRequest,
  CurrencyConversionRequest,
  SurchargeCalculationRequest,
  PreparePaymentRequest,
} from '../requests';
import { Session } from '../session';

jest.mock('react-native', () => {
  function JSONFileToString(fileName: string): string {
    return JSON.stringify(require(fileName));
  }

  const RN = jest.requireActual('react-native');
  RN.NativeModules.OnlinePaymentsSdk = {
    initialize: jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve('Success')),
    getPublicKey: jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve(
          `${JSONFileToString('./__mock_responses__/public_key_response.json')}`
        )
      ),
    getIinDetails: jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve(
          `${JSONFileToString('./__mock_responses__/iin_details_response.json')}`
        )
      ),
    getBasicPaymentProducts: jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve(
          `${JSONFileToString('./__mock_responses__/basic_payment_products_response.json')}`
        )
      ),
    getPaymentProduct: jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve(
          `${JSONFileToString('./__mock_responses__/payment_product_response.json')}`
        )
      ),
    getPaymentProductNetworks: jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve(
          `${JSONFileToString('./__mock_responses__/payment_product_networks_response.json')}`
        )
      ),
    getCurrencyConversionQuote: jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve(
          `${JSONFileToString('./__mock_responses__/currency_conversion_quote_response.json')}`
        )
      ),
    getSurchargeCalculation: jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve(
          `${JSONFileToString('./__mock_responses__/surcharge_calculation_response_with_surcharge.json')}`
        )
      ),
    preparePaymentRequest: jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve(
          `${JSONFileToString('./__mock_responses__/prepared_payment_request.json')}`
        )
      ),
  };
  return RN;
});

function success() {
  expect(true).toBe(true);
}

function fail(reason: string) {
  throw new Error(reason);
}

describe('Session API calls test', () => {
  let session: Session;

  beforeAll(() => {
    session = new Session({
      clientSessionId: '_clientSessionId',
      customerId: '_customerId',
      clientApiUrl: '_clientApiUrl',
      assetUrl: '_assetUrl',
    });
  });

  it('Session is initialized', () => {
    expect(session.isInitialized).toBe(true);
  });

  it('getPublicKey', () => {
    session.getPublicKey(
      new PublicKeyListener(
        (_) => {
          success();
        },
        (errorResponse) => {
          fail(
            `apiError occured when retrieving PublicKey: ${errorResponse?.message}`
          );
        },
        (exception) => {
          fail(
            `exception occured when retrieving PublicKey: ${exception?.error}`
          );
        }
      )
    );
  });

  it('getIinDetails', () => {
    const request: IinDetailsRequest = {
      partialCreditCardNumber: 'partialCreditCardNumber',
      paymentContext: {
        amountOfMoney: { amount: 200, currencyCode: 'USD' },
        countryCode: 'US',
        isRecurring: false,
      },
    };

    session.getIinDetails(
      request,
      new IinDetailsListener(
        (_) => {
          success();
        },
        (errorResponse) => {
          fail(
            `apiError occured when retrieving IinDetails: ${errorResponse?.message}`
          );
        },
        (exception) => {
          fail(
            `exception occured when retrieving IinDetails: ${exception?.error}`
          );
        }
      )
    );
  });

  it('getBasicPaymentProducts', () => {
    const paymentContext = {
      amountOfMoney: { amount: 200, currencyCode: 'USD' },
      countryCode: 'US',
      isRecurring: false,
    };

    session.getBasicPaymentProducts(
      paymentContext,
      new BasicPaymentProductsListener(
        (_) => {
          success();
        },
        (errorResponse) => {
          fail(
            `apiError occured when retrieving BasicPaymentProducts: ${errorResponse?.message}`
          );
        },
        (exception) => {
          fail(
            `exception occured when retrieving BasicPaymentProducts: ${exception?.error}`
          );
        }
      )
    );
  });

  it('getPaymentProduct', () => {
    const request: PaymentProductRequest = {
      productId: '3',
      paymentContext: {
        amountOfMoney: { amount: 200, currencyCode: 'USD' },
        countryCode: 'US',
        isRecurring: false,
      },
    };

    session.getPaymentProduct(
      request,
      new PaymentProductListener(
        (_) => {
          success();
        },
        (errorResponse) => {
          fail(
            `apiError occured when retrieving PaymentProduct: ${errorResponse?.message}`
          );
        },
        (exception) => {
          fail(
            `exception occured when retrieving PaymentProduct: ${exception?.error}`
          );
        }
      )
    );
  });

  it('getPaymentProductNetworks', () => {
    const request: PaymentProductNetworksRequest = {
      productId: '302',
      paymentContext: {
        amountOfMoney: { amount: 200, currencyCode: 'USD' },
        countryCode: 'US',
        isRecurring: false,
      },
    };

    session.getPaymentProductNetworks(
      request,
      new PaymentProductNetworksListener(
        (_) => {
          success();
        },
        (errorResponse) => {
          fail(
            `apiError occured when retrieving PaymentProductNetworks: ${errorResponse?.message}`
          );
        },
        (exception) => {
          fail(
            `exception occured when retrieving PaymentProductNetworks: ${exception?.error}`
          );
        }
      )
    );
  });

  it('getCurrencyConversionQuote', () => {
    const request = CurrencyConversionRequest.withToken(
      { amount: 200, currencyCode: 'AUD' },
      'CurrencyConversionQuoteToken'
    );

    session.getCurrencyConversionQuote(
      request,
      new CurrencyConversionQuoteListener(
        (_) => {
          success();
        },
        (errorResponse) => {
          fail(
            `apiError occured when retrieving CurrencyConversionQuote: ${errorResponse?.message}`
          );
        },
        (exception) => {
          fail(
            `exception occured when retrieving CurrencyConversionQuote: ${exception?.error}`
          );
        }
      )
    );
  });

  it('getSurchargeCalculation', () => {
    const request = SurchargeCalculationRequest.withToken(
      { amount: 200, currencyCode: 'USD' },
      'SurchargeCalculationToken'
    );

    session.getSurchargeCalculation(
      request,
      new SurchargeCalculationListener(
        (_) => {
          success();
        },
        (errorResponse) => {
          fail(
            `apiError occured when retrieving SurchargeCalculation: ${errorResponse?.message}`
          );
        },
        (exception) => {
          fail(
            `exception occured when retrieving SurchargeCalculation: ${exception?.error}`
          );
        }
      )
    );
  });

  function _createPaymentRequest(): PaymentRequest {
    const dummyPaymentProductFields: PaymentProductField[] = [];
    const dummyDisplayHints: PaymentProductDisplayHints = {
      displayOrder: 0,
      label: 'VISA',
      logo: 'VISA_logo',
    };
    const dummyPaymentProduct = new PaymentProduct({
      fields: dummyPaymentProductFields,
      displayHintsList: [dummyDisplayHints],
      id: '1',
      paymentMethod: 'card',
      paymentProductGroup: 'Cards',
      allowsRecurring: false,
      allowsTokenization: false,
      usesRedirectionTo3rdParty: false,
    });

    return new PaymentRequest(dummyPaymentProduct);
  }

  it('preparePaymentRequest', () => {
    const request = new PreparePaymentRequest(_createPaymentRequest());

    session.preparePaymentRequest(
      request,
      new PaymentRequestPreparedListener(
        (_) => {
          success();
        },
        (errorResponse) => {
          fail(
            `apiError occured when preparing PaymentRequest: ${errorResponse?.message}`
          );
        },
        (exception) => {
          fail(
            `exception occured when preparing PaymentRequest: ${exception?.error}`
          );
        }
      )
    );
  });
});
