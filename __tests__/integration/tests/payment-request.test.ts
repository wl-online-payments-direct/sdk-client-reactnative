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
import { getConfiguration, getSessionDetails } from '../setup';
import { OnlinePaymentSdk, PaymentProduct } from '../../../src';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { CreditCardTokenRequest, init, PaymentRequest } from '../../../src';
import { accountOnFileJson } from '../../__fixtures__/account-on-file-json';
import {
  createPaymentFromSdk,
  createTokenRequest,
  getApiClientSpyMock,
  getEnvVar,
  getSessionFromSdk,
} from '../utils';
import { publicKeyResponse } from '../../__fixtures__/public-key-response';
import { cardNumber } from '../../__fixtures__/card_number';
import { paymentContext } from '../../__fixtures__/payment-context';
import { JOSEEncryptor } from '../../../src/infrastructure/encryption/JOSEEncryptor';

const SDK_MERCHANT_ID = getEnvVar('VITE_ONLINEPAYMENTS_SDK_MERCHANT_ID');

describe('session.createPaymentRequest', () => {
  let session: OnlinePaymentSdk;
  let paymentProduct: PaymentProduct;
  let tokenRequest: CreditCardTokenRequest;

  beforeEach(async () => {
    session = init(getSessionDetails(), getConfiguration());
    const productSpy = getApiClientSpyMock(
      'getWithContext',
      cardPaymentProductJson
    );
    paymentProduct = await session.getPaymentProduct(1, paymentContext);
    productSpy.mockRestore();
    tokenRequest = new CreditCardTokenRequest();
  });

  const createPaymentAndExpectSuccessfulResponse = async (
    encryptedCustomerInput: string | undefined
  ) => {
    expect(encryptedCustomerInput).toBeDefined();

    if (!encryptedCustomerInput) {
      throw new Error('Expected encrypted customer input.');
    }

    const result = await createPaymentFromSdk(SDK_MERCHANT_ID, {
      encryptedCustomerInput,
    });

    expect(result).toBeDefined();
    expect(result.creationOutput).toBeDefined();
    expect(result.merchantAction).toBeDefined();
    expect(result.payment?.id).toBeDefined();

    return result;
  };

  it('should encrypt payment request`', async () => {
    const request = new PaymentRequest(paymentProduct);

    request.getField('cardholderName').setValue('Test cardholder name');
    request.getField('cvv').setValue('123');
    request.getField('expiryDate').setValue('12/2030');
    request.getField('cardNumber').setValue('4242424242424242');

    const response = await session.encryptPaymentRequest(request);

    expect(response.encryptedCustomerInput).toBeDefined();
    expect(response.encodedClientMetaInfo).toBeDefined();
  });

  it('should fail if mandatory field not set`', async () => {
    const spy = getApiClientSpyMock('get', publicKeyResponse);
    const request = new PaymentRequest(paymentProduct);

    request.getField('cardholderName').setValue('Test cardholder name');
    request.getField('cvv').setValue('123');
    request.getField('expiryDate').setValue('12/2030');

    // noinspection ES6RedundantAwait It is not redundant.
    await expect(session.encryptPaymentRequest(request)).rejects.toThrow(
      'The payment request is not valid.'
    );

    expect(spy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('if account on file present cannot change mandatory field`', async () => {
    // Use a fresh session to avoid cache hit from beforeEach (same product ID + context)
    const newSession = init(getSessionDetails(), getConfiguration());
    const productWithAofSpy = getApiClientSpyMock('getWithContext', {
      ...cardPaymentProductJson,
      accountsOnFile: [accountOnFileJson],
    });
    const productWithAof = await newSession.getPaymentProduct(
      1,
      paymentContext
    );
    productWithAofSpy.mockRestore();

    const [accountOnFile] = productWithAof.accountsOnFile;
    if (!accountOnFile) throw new Error('Expected account on file');

    const request = new PaymentRequest(productWithAof, accountOnFile);

    expect(() =>
      request.getField('cardNumber').setValue('4222422242224222')
    ).toThrow('Cannot write "READ_ONLY" field: cardNumber');
  });

  it('encrypted payload should include tokenize flag when setTokenize(true) is called', async () => {
    const publicKeySpy = getApiClientSpyMock('get', publicKeyResponse);
    const encryptSpy = vi
      .spyOn(JOSEEncryptor, 'encrypt')
      .mockReturnValue('mock.jwe.token.value.here');

    const request = new PaymentRequest(paymentProduct);
    request.getField('cardNumber').setValue('4242424242424242');
    request.getField('cardholderName').setValue('Test cardholder name');
    request.getField('cvv').setValue('123');
    request.getField('expiryDate').setValue('12/2030');
    request.setTokenize(true);

    await session.encryptPaymentRequest(request);

    expect(encryptSpy).toHaveBeenCalledOnce();

    const encryptCall = encryptSpy.mock.calls[0];

    if (!encryptCall) {
      throw new Error('Expected JOSE encrypt to have been called.');
    }

    const [capturedPayload] = encryptCall;

    expect(capturedPayload).toMatchObject({
      tokenize: true,
    });

    publicKeySpy.mockRestore();
    encryptSpy.mockRestore();
  });

  it('can create payment with valid request', async () => {
    const request = new PaymentRequest(paymentProduct);

    request.getField('cardNumber').setValue(cardNumber);
    request.getField('cardholderName').setValue('Test cardholder name');
    request.getField('cvv').setValue('123');
    request.getField('expiryDate').setValue('12/2030');

    const encryptedData = await session.encryptPaymentRequest(request);

    await createPaymentAndExpectSuccessfulResponse(
      encryptedData.encryptedCustomerInput
    );
  });

  it('can create payment with valid AOF', async () => {
    tokenRequest.setCardNumber('4567350000427977');
    tokenRequest.setCardholderName('Darwin Núñez');
    tokenRequest.setExpiryDate('1230');
    tokenRequest.setSecurityCode('123');
    tokenRequest.setProductPaymentId(1);

    const preparedPaymentRequest =
      await session.encryptTokenRequest(tokenRequest);
    expect(preparedPaymentRequest.encryptedCustomerInput).toBeDefined();

    const tokenResult = await createTokenRequest(SDK_MERCHANT_ID, {
      encryptedCustomerInput: preparedPaymentRequest.encryptedCustomerInput,
      paymentProductId: 1,
    });

    expect(tokenResult).toBeDefined();

    const sessionDetails = await getSessionFromSdk({
      merchantId: SDK_MERCHANT_ID,
      sessionRequest: {
        tokens: [tokenResult],
      },
    });

    expect(sessionDetails).toBeDefined();
    const newSession = init(sessionDetails);

    const paymentProductWithAof = await newSession.getPaymentProduct(
      1,
      paymentContext
    );

    expect(paymentProductWithAof.accountsOnFile).toHaveLength(1);

    const [accountOnFile] = paymentProductWithAof.accountsOnFile;

    if (!accountOnFile) {
      throw new Error('Expected one account on file.');
    }

    expect(accountOnFile.getValue('cardholderName')).toBe('Darwin Núñez');
    expect(accountOnFile.getValue('expiryDate')).toBe('1230');
    expect(accountOnFile.getValue('cardNumber')).toBe('456735XXXXXX7977');

    const request = new PaymentRequest(paymentProductWithAof, accountOnFile);
    request.setValue('cardholderName', 'Darwin Núñez');
    request.setValue('cardNumber', '4567350000427977');
    request.setValue('expiryDate', '12/26');

    request.setValue('cvv', '1');

    await expect(newSession.encryptPaymentRequest(request)).rejects.toThrow();

    request.setValue('cvv', '222');

    const encryptedData = await newSession.encryptPaymentRequest(request);

    await createPaymentAndExpectSuccessfulResponse(
      encryptedData.encryptedCustomerInput
    );
  });
});
