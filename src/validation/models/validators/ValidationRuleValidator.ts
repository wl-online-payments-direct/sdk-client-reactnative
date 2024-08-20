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

import type { ValidationErrorMessage } from '../ValidationErrorMessage';
import type { ValidationRule } from '../ValidationRule';
import type { PaymentRequest } from '../../../api/models/payment-request/PaymentRequest';
import type { RuleValidationRequest } from '../requests/RuleValidationRequest';
import { ValidationErrorMessageParser } from './ValidationErrorMessageParser';
import type { PaymentRequestFieldRuleValidationRequest } from '../requests/PaymentRequestFieldRuleValidationRequest';

export class ValidationRuleValidator {
  static async validateValueForValidationRule(
    value: string,
    rule: ValidationRule
  ): Promise<ValidationErrorMessage[]> {
    const validationRequest: RuleValidationRequest = { value, rule };
    const validationResultString =
      await nativeValidationCommunicator.validateValueForValidationRule(
        validationRequest
      );
    return ValidationErrorMessageParser.parseValidationErrorMessages(
      validationResultString
    );
  }

  static async validateValidationRuleForFieldOfPaymentRequest(
    paymentRequest: PaymentRequest,
    fieldId: string,
    rule: ValidationRule
  ): Promise<ValidationErrorMessage[]> {
    const validationRequest: PaymentRequestFieldRuleValidationRequest = {
      paymentRequest,
      fieldId,
      rule,
    };
    const validationResultString =
      await nativeValidationCommunicator.validateValidationRuleForFieldOfPaymentRequest(
        validationRequest
      );
    return ValidationErrorMessageParser.parseValidationErrorMessages(
      validationResultString
    );
  }
}
