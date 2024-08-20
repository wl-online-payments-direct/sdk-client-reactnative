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

import type { PaymentRequest } from '../../../api/models/payment-request/PaymentRequest';
import { nativeMaskingCommunicator } from '../../nativeMaskingCommunicator';
import type {
  PaymentRequestAllMaskedValuesRequest,
  PaymentRequestMaskedValueRequest,
} from '../../../masker';

export class PaymentRequestMasker {
  static async maskedValue(
    request: PaymentRequest,
    fieldId: string
  ): Promise<string> {
    const maskedValueRequest: PaymentRequestMaskedValueRequest = {
      request,
      fieldId,
    };
    const maskedValue =
      await nativeMaskingCommunicator.maskedValueForPaymentRequest(
        maskedValueRequest
      );
    return maskedValue;
  }

  static async unmaskedValue(
    request: PaymentRequest,
    fieldId: string
  ): Promise<string> {
    const unmaskedValueRequest: PaymentRequestMaskedValueRequest = {
      request,
      fieldId,
    };
    const unmaskedValue =
      await nativeMaskingCommunicator.unmaskedValueForPaymentRequest(
        unmaskedValueRequest
      );
    return unmaskedValue;
  }

  static async maskedValues(
    request: PaymentRequest
  ): Promise<Map<string, string>> {
    const maskedValuesRequest: PaymentRequestAllMaskedValuesRequest = {
      request,
    };
    const maskedValuesString =
      await nativeMaskingCommunicator.allMaskedValuesForPaymentRequest(
        maskedValuesRequest
      );

    if (maskedValuesString !== undefined && maskedValuesString !== null) {
      const maskedValuesMap = JSON.parse(maskedValuesString) as Map<
        string,
        string
      >;
      return maskedValuesMap;
    }

    return new Map<string, string>();
  }

  static async unmaskedValues(
    request: PaymentRequest
  ): Promise<Map<string, string>> {
    const unmaskedValuesRequest: PaymentRequestAllMaskedValuesRequest = {
      request,
    };
    const unmaskedValuesString =
      await nativeMaskingCommunicator.allUnmaskedValuesForPaymentRequest(
        unmaskedValuesRequest
      );

    if (unmaskedValuesString !== undefined && unmaskedValuesString !== null) {
      const unmaskedValuesMap = JSON.parse(unmaskedValuesString) as Map<
        string,
        string
      >;
      return unmaskedValuesMap;
    }

    return new Map<string, string>();
  }
}
