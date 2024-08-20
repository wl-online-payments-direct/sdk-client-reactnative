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
import { nativeValidationCommunicator } from '../../nativeValidationCommunicator';
import type { PaymentRequestFieldValidationRequest } from '../requests/PaymentRequestFieldValidationRequest';
import type { PaymentRequestValidationRequest } from '../requests/PaymentRequestValidationRequest';
import type { ValidationErrorMessage } from '../ValidationErrorMessage';
import { ValidationErrorMessageParser } from './ValidationErrorMessageParser';

export class PaymentRequestValidator {
  static async validatePaymentRequest(
    request: PaymentRequest
  ): Promise<ValidationErrorMessage[]> {
    const validationRequest: PaymentRequestValidationRequest = {
      paymentRequest: request,
    };
    const validationResultString =
      await nativeValidationCommunicator.validatePaymentRequest(
        validationRequest
      );
    return ValidationErrorMessageParser.parseValidationErrorMessages(
      validationResultString
    );
  }

  static async validatePaymentProductFieldForPaymentRequest(
    fieldId: string,
    request: PaymentRequest
  ): Promise<ValidationErrorMessage[]> {
    const validationRequest: PaymentRequestFieldValidationRequest = {
      paymentRequest: request,
      fieldId,
    };
    const validationResultString =
      await nativeValidationCommunicator.validatePaymentProductFieldForPaymentRequest(
        validationRequest
      );
    return ValidationErrorMessageParser.parseValidationErrorMessages(
      validationResultString
    );
  }
}
