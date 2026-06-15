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
import type { ClientService } from '../../../src/services/interfaces/ClientService';
import {
  type AmountOfMoney,
  ConversionResultType,
  type CurrencyConversionRequest,
  type CurrencyConversionResponse,
  IinDetailsResponse,
  IinDetailStatus,
  InvalidArgumentError,
  type PartialCard,
  type PaymentContextWithAmount,
  ResponseError,
  type SdkResponse,
  type SurchargeCalculationRequest,
  type SurchargeCalculationResponse,
  SurchargeResult,
} from '../../../src';
import { DefaultClientService } from '../../../src/services/DefaultClientService';
import { CacheManager } from '../../../src/infrastructure/utils/CacheManager';
import { TestApiClient } from '../testUtils/TestApiClient';

let service: ClientService;
let amountOfMoney: AmountOfMoney;
let partialCard: PartialCard;
let currencyConversionResponse: CurrencyConversionResponse;
let surchargeResponse: SurchargeCalculationResponse;

beforeEach(() => {
  service = new DefaultClientService(new CacheManager(), new TestApiClient());

  amountOfMoney = {
    amount: 1000,
    currencyCode: 'EUR',
  };

  partialCard = {
    partialCreditCardNumber: '123456789',
    paymentProductId: 1,
  };

  currencyConversionResponse = {
    docSessionId: '1',
    result: {
      resultReason: 'test reason',
      result: ConversionResultType.Allowed,
    },
    proposal: {
      baseAmount: {
        amount: 1000,
        currencyCode: 'EUR',
      },
      targetAmount: {
        amount: 1200,
        currencyCode: 'EUR',
      },
      rate: {
        exchangeRate: 1,
        invertedExchangeRate: 1,
        markUpRate: 1,
        quotationDateTime: 'test',
        source: 'test source',
      },
    },
  };

  surchargeResponse = {
    surcharges: [
      {
        result: SurchargeResult.OK,
        paymentProductId: 1,
        surchargeAmount: { amount: 25, currencyCode: 'EUR' },
        netAmount: { amount: 1500, currencyCode: 'EUR' },
        totalAmount: { amount: 1525, currencyCode: 'EUR' },
      },
    ],
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getIinDetails', () => {
  let iinDetails: IinDetailsResponse;
  let paymentContextWithAmount: PaymentContextWithAmount;
  beforeEach(() => {
    iinDetails = new IinDetailsResponse(IinDetailStatus.SUPPORTED, 'NL', 1);

    paymentContextWithAmount = {
      countryCode: 'NL',
      amountOfMoney: {
        currencyCode: 'EUR',
        amount: 1000,
      },
    };
  });

  it('should return iinDetails response from cache', async () => {
    const apiSpy = vi.spyOn(TestApiClient.prototype, 'post');
    const cacheHasSpy = vi
      .spyOn(CacheManager.prototype, 'has')
      .mockReturnValue(true);
    const cacheGetSpy = vi
      .spyOn(CacheManager.prototype, 'get')
      .mockReturnValue(iinDetails);
    const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

    const result = await service.getIinDetails(
      '42424242',
      paymentContextWithAmount
    );

    expect(cacheHasSpy).toHaveBeenCalledTimes(1);
    expect(cacheGetSpy).toHaveBeenCalledTimes(1);

    expect(apiSpy).not.toHaveBeenCalled();
    expect(cacheSetSpy).not.toHaveBeenCalled();

    expect(result).toBe(iinDetails);
  });

  it('should return iinDetails from API', async () => {
    const apiResponse: SdkResponse<IinDetailsResponse> = {
      status: 200,
      success: true,
      data: iinDetails,
    };

    const bin = '42424242';

    const apiSpy = vi
      .spyOn(TestApiClient.prototype, 'post')
      .mockResolvedValue(apiResponse);

    const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

    const result = await service.getIinDetails(bin, paymentContextWithAmount);

    expect(apiSpy).toHaveBeenCalledTimes(1);
    const [path, options] = apiSpy.mock.calls[0]!;
    const parsedBody = JSON.parse(options?.body as string);

    expect(path).toBe('/services/getIINdetails');
    expect(parsedBody).toEqual({
      bin,
      paymentContext: paymentContextWithAmount,
    });

    expect(cacheSetSpy).toHaveBeenCalledTimes(1);
    expect(cacheSetSpy).toHaveBeenCalledWith(
      expect.stringContaining(`getIinDetails-${bin}`),
      iinDetails
    );
    expect(result).toEqual(iinDetails);
  });

  it('formats partial credit card number and uses it as bin in API request on cache miss', async () => {
    const apiSpy = vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue({
      success: true,
      status: 200,
      data: {
        status: IinDetailStatus.SUPPORTED,
        isAllowedInContext: true,
        countryCode: 'NL',
        paymentProductId: 1,
      } as IinDetailsResponse,
    });

    await service.getIinDetails('1234 5678 9', paymentContextWithAmount);

    expect(apiSpy).toHaveBeenCalledTimes(1);

    const [, options] = apiSpy.mock.calls[0]!;
    const body = JSON.parse(options?.body as string);
    expect(body.bin).toBe('12345678');
  });

  it('throws InvalidArgumentError when formatted credit card number has fewer than 6 digits', async () => {
    const promise = service.getIinDetails('12345', paymentContextWithAmount);

    try {
      await promise;
      expect.fail('Should throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidArgumentError);

      const response = (
        (error as InvalidArgumentError).metadata as { data: IinDetailsResponse }
      ).data;

      expect(response.status).toBe(IinDetailStatus.NOT_ENOUGH_DIGITS);
    }
  });

  it('returns IinDetailsResponse with SUPPORTED status when isAllowedInContext is not false', async () => {
    vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue({
      success: true,
      status: 200,
      data: {
        status: IinDetailStatus.SUPPORTED,
        isAllowedInContext: true,
        countryCode: 'NL',
        paymentProductId: 1,
      } as IinDetailsResponse,
    });

    const result = await service.getIinDetails(
      '424242424242',
      paymentContextWithAmount
    );

    expect(result.status).toBe(IinDetailStatus.SUPPORTED);
  });

  it('returns IinDetailsResponse with EXISTING_BUT_NOT_ALLOWED status when isAllowedInContext is false', async () => {
    vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue({
      success: true,
      status: 200,
      data: {
        status: IinDetailStatus.EXISTING_BUT_NOT_ALLOWED,
        isAllowedInContext: false,
        countryCode: 'NL',
        paymentProductId: 1,
      } as IinDetailsResponse,
    });

    const result = await service.getIinDetails(
      '424242424242',
      paymentContextWithAmount
    );

    expect(result.status).toBe(IinDetailStatus.EXISTING_BUT_NOT_ALLOWED);
  });

  it('throws ResponseError when API response is invalid', async () => {
    vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue({
      success: false,
      status: 400,
      data: undefined,
    });

    const promise = service.getIinDetails(
      '424242424242',
      paymentContextWithAmount
    );

    await expect(promise).rejects.toThrow(ResponseError);
  });
});

describe('getCurrencyConversionQuote', () => {
  it('returns cached value when available and does not call API for currency quote', async () => {
    const cachedValue: CurrencyConversionResponse = {
      docSessionId: '1',
      result: {
        resultReason: 'test reason',
        result: ConversionResultType.Allowed,
      },
      proposal: {
        baseAmount: {
          amount: 1000,
          currencyCode: 'EUR',
        },
        targetAmount: {
          amount: 1200,
          currencyCode: 'EUR',
        },
        rate: {
          exchangeRate: 1,
          invertedExchangeRate: 1,
          markUpRate: 1,
          quotationDateTime: 'test',
          source: 'test source',
        },
      },
    };

    const apiSpy = vi.spyOn(TestApiClient.prototype, 'post');
    const cacheHasSpy = vi
      .spyOn(CacheManager.prototype, 'has')
      .mockReturnValue(true);
    const cacheGetSpy = vi
      .spyOn(CacheManager.prototype, 'get')
      .mockReturnValue(cachedValue);
    const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');
    const result = await service.getCurrencyConversionQuote(
      amountOfMoney,
      partialCard
    );

    expect(cacheHasSpy).toHaveBeenCalledTimes(1);
    expect(cacheGetSpy).toHaveBeenCalledTimes(1);
    expect(apiSpy).not.toHaveBeenCalled();
    expect(cacheSetSpy).not.toHaveBeenCalled();

    expect(result).toBe(cachedValue);
  });

  it('calls API, caches result, and returns data when not cached', async () => {
    const request: CurrencyConversionRequest = {
      cardSource: {
        card: {
          cardNumber: partialCard.partialCreditCardNumber,
          paymentProductId: partialCard.paymentProductId,
        },
      },
      transaction: { amount: amountOfMoney },
    };

    const apiResponse: SdkResponse<CurrencyConversionResponse> = {
      status: 200,
      success: true,
      data: currencyConversionResponse,
    };

    const apiSpy = vi
      .spyOn(TestApiClient.prototype, 'post')
      .mockResolvedValue(apiResponse);
    const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

    const result = await service.getCurrencyConversionQuote(
      amountOfMoney,
      partialCard
    );

    expect(apiSpy).toHaveBeenCalledTimes(1);

    const [path, options, apiVersion] = apiSpy.mock.calls[0]!;
    const parsedBody = JSON.parse(options?.body as string);

    expect(path).toBe('/services/dccrate');
    expect(apiVersion).toBe('v2');
    expect(parsedBody).toEqual(request);

    expect(cacheSetSpy).toHaveBeenCalledTimes(1);
    expect(cacheSetSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `getCurrencyConversionQuote-${amountOfMoney.amount}-${amountOfMoney.currencyCode}`
      ),
      currencyConversionResponse
    );

    expect(result).toBe(currencyConversionResponse);
  });

  it('uses token card source in request when cardOrToken is a string', async () => {
    const token = 'token-123';
    const apiSpy = vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue({
      success: true,
      status: 200,
      data: currencyConversionResponse,
    });

    await service.getCurrencyConversionQuote(amountOfMoney, token);

    expect(apiSpy).toHaveBeenCalledTimes(1);

    const [, options] = apiSpy.mock.calls[0]!;
    const body = JSON.parse(options?.body as string);
    expect(body.cardSource).toEqual({ token });
  });

  it('throws ResponseError when API response is invalid', async () => {
    vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue({
      success: false,
      status: 400,
      data: undefined,
    });

    const promise = service.getCurrencyConversionQuote(
      amountOfMoney,
      partialCard
    );

    await expect(promise).rejects.toThrow(ResponseError);
  });
});

describe('getSurchargeCalculation', () => {
  it("returns cached value for surcharge and doesn't call API", async () => {
    const apiSpy = vi.spyOn(TestApiClient.prototype, 'post');
    const cacheHasSpy = vi
      .spyOn(CacheManager.prototype, 'has')
      .mockReturnValue(true);
    const cacheGetSpy = vi
      .spyOn(CacheManager.prototype, 'get')
      .mockReturnValue(surchargeResponse);
    const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

    const result = await service.getSurchargeCalculation(
      amountOfMoney,
      partialCard
    );

    expect(cacheHasSpy).toHaveBeenCalledTimes(1);
    expect(cacheGetSpy).toHaveBeenCalledTimes(1);
    expect(apiSpy).not.toHaveBeenCalled();
    expect(cacheSetSpy).not.toHaveBeenCalled();

    expect(result).toBe(surchargeResponse);
  });

  it('calls API, caches result, and returns data when not cached', async () => {
    const request: SurchargeCalculationRequest = {
      cardSource: {
        card: {
          cardNumber: partialCard.partialCreditCardNumber,
          paymentProductId: partialCard.paymentProductId,
        },
      },
      amountOfMoney: amountOfMoney,
    };
    const apiResponse: SdkResponse<SurchargeCalculationResponse> = {
      status: 200,
      success: true,
      data: surchargeResponse,
    };

    const apiSpy = vi
      .spyOn(TestApiClient.prototype, 'post')
      .mockResolvedValue(apiResponse);
    const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

    const result = await service.getSurchargeCalculation(
      amountOfMoney,
      partialCard
    );

    expect(apiSpy).toHaveBeenCalledTimes(1);

    const [path, options] = apiSpy.mock.calls[0]!;
    const parsedBody = JSON.parse(options?.body as string);

    expect(path).toBe('/services/surchargeCalculation');
    expect(parsedBody).toEqual(request);

    expect(cacheSetSpy).toHaveBeenCalledTimes(1);
    expect(cacheSetSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `getSurchargeCalculation-${amountOfMoney.amount}-${amountOfMoney.currencyCode}`
      ),
      surchargeResponse
    );

    expect(result).toBe(surchargeResponse);
  });

  it('uses token card source in request when cardOrToken is a string', async () => {
    const token = 'token-123';
    const apiSpy = vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue({
      success: true,
      status: 200,
      data: surchargeResponse,
    });

    await service.getSurchargeCalculation(amountOfMoney, token);

    expect(apiSpy).toHaveBeenCalledTimes(1);

    const [, options] = apiSpy.mock.calls[0]!;
    const body = JSON.parse(options?.body as string);
    expect(body.cardSource).toEqual({ token });
  });

  it('throws ResponseError when API response is invalid', async () => {
    vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue({
      success: false,
      status: 400,
      data: undefined,
    });

    const promise = service.getSurchargeCalculation(amountOfMoney, partialCard);

    await expect(promise).rejects.toThrow(ResponseError);
  });
});
