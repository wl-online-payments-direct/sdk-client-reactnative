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

import type { AmountOfMoney } from '../payment-context/AmountOfMoney';
import type { CurrencyConversion } from '../services/currency-conversion/CurrencyConversion'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Request used to retrieve a {@link CurrencyConversion} from the API.
 */
export class CurrencyConversionRequest {
  amountOfMoney: AmountOfMoney;
  partialCreditCardNumber?: string;
  paymentProductId?: number;
  token?: string;

  private constructor(
    amountOfMoney: AmountOfMoney,
    partialCreditCardNumber?: string,
    paymentProductId?: number,
    token?: string
  ) {
    this.amountOfMoney = amountOfMoney;
    this.partialCreditCardNumber = partialCreditCardNumber;
    this.paymentProductId = paymentProductId;
    this.token = token;
  }

  static withPartialCreditCardNumber(
    amountOfMoney: AmountOfMoney,
    partialCreditCardNumber: string,
    paymentProductId?: number
  ): CurrencyConversionRequest {
    return new CurrencyConversionRequest(
      amountOfMoney,
      partialCreditCardNumber,
      paymentProductId,
      undefined
    );
  }

  static withToken(
    amountOfMoney: AmountOfMoney,
    token: string
  ): CurrencyConversionRequest {
    return new CurrencyConversionRequest(
      amountOfMoney,
      undefined,
      undefined,
      token
    );
  }
}
