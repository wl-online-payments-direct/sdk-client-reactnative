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

import type { ValidationType } from '../ValidationType';
import { ValidationRule } from '../ValidationRule';

/**
 * Used for validation of whether a value conforms to a regular expression.
 */
export class ValidationRuleRegularExpression extends ValidationRule {
  readonly regex: string;

  constructor(
    validationType: ValidationType,
    messageId: string,
    regex: string
  ) {
    super(validationType, messageId);
    this.regex = regex;
  }
}
