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

import type { PaymentRequest } from '../../api/models/payment-request/PaymentRequest';
import { ValidationRuleValidator } from '../../validator';
import type { ValidationErrorMessage } from './ValidationErrorMessage';
import type { ValidationType } from './ValidationType';

/**
 * Contains functionality to handle validation.
 */
export class ValidationRule {
  readonly validationType: ValidationType;
  readonly messageId: string;

  constructor(validationType: ValidationType, messageId: string) {
    this.validationType = validationType;
    this.messageId = messageId;
  }

  async validateValueForFieldOfPaymentRequest(
    fieldId: string,
    request: PaymentRequest
  ): Promise<ValidationErrorMessage[]> {
    const validationErrorMessages =
      await ValidationRuleValidator.validateValidationRuleForFieldOfPaymentRequest(
        request,
        fieldId,
        this
      );
    return validationErrorMessages;
  }

  async validateValue(value: string): Promise<ValidationErrorMessage[]> {
    const validationErrorMessages =
      await ValidationRuleValidator.validateValueForValidationRule(value, this);
    return validationErrorMessages;
  }
}
