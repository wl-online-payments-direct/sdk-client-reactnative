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

import type { ValidationErrorMessage } from '../ValidationErrorMessage';

export class ValidationErrorMessageParser {
  static parseValidationErrorMessages(
    validationResultString: string
  ): ValidationErrorMessage[] {
    const validationErrorMessages = JSON.parse(
      validationResultString
    ) as ValidationErrorMessage[];
    return validationErrorMessages;
  }
}
