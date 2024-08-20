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

import { nativeValidationCommunicator } from '../../nativeValidationCommunicator';
import { ValidationErrorMessageParser } from '../../../validation/models/validators/ValidationErrorMessageParser';
import type { PaymentProductFieldValidationRequest } from '../../../validation/models/requests/PaymentProductFieldValidationRequest';
import type { PaymentProductField } from '../../../api/models/payment-product/payment-product-field/PaymentProductField';
import type { ValidationErrorMessage } from '../ValidationErrorMessage';

export class PaymentProductFieldValidator {
  static async validateValueForPaymentProductField(
    value: string,
    field: PaymentProductField
  ): Promise<ValidationErrorMessage[]> {
    const validationRequest: PaymentProductFieldValidationRequest = {
      value,
      field,
    };
    const validationResultString =
      await nativeValidationCommunicator.validateValueForPaymentProductField(
        validationRequest
      );
    return ValidationErrorMessageParser.parseValidationErrorMessages(
      validationResultString
    );
  }
}
