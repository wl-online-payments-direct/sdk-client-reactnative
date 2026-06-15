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
import { OnlinePaymentSdk } from '../../../src';
import type { ServiceFactory } from '../../../src/infrastructure/interfaces/ServiceFactory';
import type { EncryptionService } from '../../../src/services/interfaces/EncryptionService';
import type { PaymentProductService } from '../../../src/services/interfaces/PaymentProductService';
import type { ClientService } from '../../../src/services/interfaces/ClientService';
import {
  init,
  type PaymentContext,
  type PaymentContextWithAmount,
  type SdkConfiguration,
  type SessionData,
} from '../../../src';
import * as SessionDataNormalizerModule from '../../../src/facade/SessionDataNormalizer';

describe('OnlinePaymentSdk', () => {
  let sessionData: SessionData;
  let mockEncryptionService: EncryptionService;
  let mockPaymentProductService: PaymentProductService;
  let mockClientService: ClientService;
  let mockServiceFactory: ServiceFactory;
  let sdk: OnlinePaymentSdk;

  const createPaymentContext = (): PaymentContext => ({
    countryCode: 'NL',
    amountOfMoney: {
      amount: 1000,
      currencyCode: 'EUR',
    },
  });

  const createPaymentContextWithAmount = (): PaymentContextWithAmount => ({
    countryCode: 'NL',
    amountOfMoney: {
      amount: 1000,
      currencyCode: 'EUR',
    },
  });

  const createAmountOfMoney = () => ({
    amount: 1000,
    currencyCode: 'EUR',
  });

  const createCard = () => ({
    partialCreditCardNumber: '424242',
  });

  beforeEach(() => {
    sessionData = {
      clientSessionId: 'test-session-id',
      customerId: 'test-customer-id',
      clientApiUrl: 'https://api.example.com/client',
      assetUrl: 'https://assets.example.com',
    };

    mockEncryptionService = {
      getPublicKey: vi.fn(),
      encryptPaymentRequest: vi.fn(),
      encryptTokenRequest: vi.fn(),
    } as unknown as EncryptionService;

    mockPaymentProductService = {
      getBasicPaymentProducts: vi.fn(),
      getPaymentProduct: vi.fn(),
      getPaymentProductNetworks: vi.fn(),
    } as unknown as PaymentProductService;

    mockClientService = {
      getIinDetails: vi.fn(),
      getSurchargeCalculation: vi.fn(),
      getCurrencyConversionQuote: vi.fn(),
    } as unknown as ClientService;

    mockServiceFactory = {
      getEncryptionService: vi.fn().mockReturnValue(mockEncryptionService),
      getPaymentProductService: vi
        .fn()
        .mockReturnValue(mockPaymentProductService),
      getClientService: vi.fn().mockReturnValue(mockClientService),
    } as unknown as ServiceFactory;

    sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create instance with session data', () => {
    expect(sdk).toBeInstanceOf(OnlinePaymentSdk);
  });

  it('should create instance when initializing SDK', () => {
    const initializedSdk = init(sessionData);

    expect(initializedSdk).toBeInstanceOf(OnlinePaymentSdk);
  });

  it('should create instance with session data and configuration', () => {
    const config: SdkConfiguration = {
      appIdentifier: 'TestApp',
    };

    const configuredSdk = new OnlinePaymentSdk(
      sessionData,
      config,
      mockServiceFactory
    );

    expect(configuredSdk).toBeInstanceOf(OnlinePaymentSdk);
  });

  it('should use DefaultServiceFactory when no factory is provided', () => {
    // This test verifies OnlinePaymentSdk creates instance without explicit factory.
    // Note: DefaultServiceFactory construction IS exercised (not mocked), but services
    // are isolated from external dependencies via default mocks (TestApiClient rejects by default).
    const sdkInstance = new OnlinePaymentSdk(sessionData);

    expect(sdkInstance).toBeInstanceOf(OnlinePaymentSdk);
  });

  it('should normalize session data before creating default factory', () => {
    const normalizeSpy = vi.spyOn(SessionDataNormalizerModule, 'normalize');

    const normalizedSdk = new OnlinePaymentSdk(sessionData);

    expect(normalizedSdk).toBeInstanceOf(OnlinePaymentSdk);
    expect(normalizeSpy).toHaveBeenCalledWith(sessionData);
  });

  interface AsyncMock {
    mockResolvedValue(value: unknown): void;
    mockRejectedValue(error: unknown): void;
  }

  const toMock = (fn: unknown): AsyncMock => fn as unknown as AsyncMock;

  describe('service delegation — delegates and returns value', () => {
    it.each([
      {
        method: 'getBasicPaymentProducts',
        arrange: () => {
          const paymentContext = createPaymentContext();
          const value = {
            paymentProducts: [],
            accountsOnFile: [],
          };

          return {
            call: () => sdk.getBasicPaymentProducts(paymentContext),
            getMock: () =>
              toMock(mockPaymentProductService.getBasicPaymentProducts),
            expectedArguments: [paymentContext],
            value,
          };
        },
      },
      {
        method: 'getPaymentProduct',
        arrange: () => {
          const paymentContext = createPaymentContext();
          const value = {} as unknown;

          return {
            call: () => sdk.getPaymentProduct(1, paymentContext),
            getMock: () => toMock(mockPaymentProductService.getPaymentProduct),
            expectedArguments: [1, paymentContext],
            value,
          };
        },
      },
      {
        method: 'getPaymentProductNetworks',
        arrange: () => {
          const paymentContext = createPaymentContext();
          const value = { networks: [] } as unknown;

          return {
            call: () => sdk.getPaymentProductNetworks(1, paymentContext),
            getMock: () =>
              toMock(mockPaymentProductService.getPaymentProductNetworks),
            expectedArguments: [1, paymentContext],
            value,
          };
        },
      },
      {
        method: 'getSurchargeCalculation',
        arrange: () => {
          const amountOfMoney = createAmountOfMoney();
          const card = createCard();
          const value = {} as unknown;

          return {
            call: () => sdk.getSurchargeCalculation(amountOfMoney, card),
            getMock: () => toMock(mockClientService.getSurchargeCalculation),
            expectedArguments: [amountOfMoney, card],
            value,
          };
        },
      },
      {
        method: 'getCurrencyConversionQuote',
        arrange: () => {
          const amountOfMoney = createAmountOfMoney();
          const card = createCard();
          const value = {} as unknown;

          return {
            call: () => sdk.getCurrencyConversionQuote(amountOfMoney, card),
            getMock: () => toMock(mockClientService.getCurrencyConversionQuote),
            expectedArguments: [amountOfMoney, card],
            value,
          };
        },
      },
      {
        method: 'getIinDetails',
        arrange: () => {
          const partialCreditCardNumber = '424242';
          const paymentContext = createPaymentContextWithAmount();
          const value = {} as unknown;

          return {
            call: () =>
              sdk.getIinDetails(partialCreditCardNumber, paymentContext),
            getMock: () => toMock(mockClientService.getIinDetails),
            expectedArguments: [partialCreditCardNumber, paymentContext],
            value,
          };
        },
      },
      {
        method: 'getPublicKey',
        arrange: () => {
          const value = {} as unknown;

          return {
            call: () => sdk.getPublicKey(),
            getMock: () => toMock(mockEncryptionService.getPublicKey),
            expectedArguments: [],
            value,
          };
        },
      },
      {
        method: 'encryptPaymentRequest',
        arrange: () => {
          const paymentRequest = {} as Parameters<
            OnlinePaymentSdk['encryptPaymentRequest']
          >[0];
          const value = {
            encryptedCustomerInput: 'enc',
            encodedClientMetaInfo: 'meta',
          };

          return {
            call: () => sdk.encryptPaymentRequest(paymentRequest),
            getMock: () => toMock(mockEncryptionService.encryptPaymentRequest),
            expectedArguments: [paymentRequest],
            value,
          };
        },
      },
      {
        method: 'encryptTokenRequest',
        arrange: () => {
          const tokenRequest = {} as Parameters<
            OnlinePaymentSdk['encryptTokenRequest']
          >[0];
          const value = {
            encryptedCustomerInput: 'enc',
            encodedClientMetaInfo: 'meta',
          };

          return {
            call: () => sdk.encryptTokenRequest(tokenRequest),
            getMock: () => toMock(mockEncryptionService.encryptTokenRequest),
            expectedArguments: [tokenRequest],
            value,
          };
        },
      },
    ])('$method', async ({ arrange }) => {
      const { call, getMock, expectedArguments, value } = arrange();
      const serviceMethod = getMock();

      serviceMethod.mockResolvedValue(value);

      const result = await call();

      expect(serviceMethod).toHaveBeenCalledWith(...expectedArguments);
      expect(result).toEqual(value);
    });
  });

  describe('service delegation — propagates rejection', () => {
    it.each([
      {
        method: 'getBasicPaymentProducts',
        arrange: () => {
          const paymentContext = createPaymentContext();

          return {
            call: () => sdk.getBasicPaymentProducts(paymentContext),
            getMock: () =>
              toMock(mockPaymentProductService.getBasicPaymentProducts),
          };
        },
      },
      {
        method: 'getPaymentProduct',
        arrange: () => {
          const paymentContext = createPaymentContext();

          return {
            call: () => sdk.getPaymentProduct(1, paymentContext),
            getMock: () => toMock(mockPaymentProductService.getPaymentProduct),
          };
        },
      },
      {
        method: 'getPaymentProductNetworks',
        arrange: () => {
          const paymentContext = createPaymentContext();

          return {
            call: () => sdk.getPaymentProductNetworks(1, paymentContext),
            getMock: () =>
              toMock(mockPaymentProductService.getPaymentProductNetworks),
          };
        },
      },
      {
        method: 'getSurchargeCalculation',
        arrange: () => {
          const amountOfMoney = createAmountOfMoney();
          const card = createCard();

          return {
            call: () => sdk.getSurchargeCalculation(amountOfMoney, card),
            getMock: () => toMock(mockClientService.getSurchargeCalculation),
          };
        },
      },
      {
        method: 'getCurrencyConversionQuote',
        arrange: () => {
          const amountOfMoney = createAmountOfMoney();
          const card = createCard();

          return {
            call: () => sdk.getCurrencyConversionQuote(amountOfMoney, card),
            getMock: () => toMock(mockClientService.getCurrencyConversionQuote),
          };
        },
      },
      {
        method: 'getIinDetails',
        arrange: () => {
          const partialCreditCardNumber = '424242';
          const paymentContext = createPaymentContextWithAmount();

          return {
            call: () =>
              sdk.getIinDetails(partialCreditCardNumber, paymentContext),
            getMock: () => toMock(mockClientService.getIinDetails),
          };
        },
      },
      {
        method: 'getPublicKey',
        arrange: () => ({
          call: () => sdk.getPublicKey(),
          getMock: () => toMock(mockEncryptionService.getPublicKey),
        }),
      },
      {
        method: 'encryptPaymentRequest',
        arrange: () => {
          const paymentRequest = {} as Parameters<
            OnlinePaymentSdk['encryptPaymentRequest']
          >[0];

          return {
            call: () => sdk.encryptPaymentRequest(paymentRequest),
            getMock: () => toMock(mockEncryptionService.encryptPaymentRequest),
          };
        },
      },
      {
        method: 'encryptTokenRequest',
        arrange: () => {
          const tokenRequest = {} as Parameters<
            OnlinePaymentSdk['encryptTokenRequest']
          >[0];

          return {
            call: () => sdk.encryptTokenRequest(tokenRequest),
            getMock: () => toMock(mockEncryptionService.encryptTokenRequest),
          };
        },
      },
    ])('$method', async ({ arrange }) => {
      const { call, getMock } = arrange();
      const error = new Error('service error');
      const serviceMethod = getMock();

      serviceMethod.mockRejectedValue(error);

      await expect(call()).rejects.toBe(error);
    });
  });
});
