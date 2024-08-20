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
 * Used for validation of the length of an input.
 */
export class ValidationRuleLength extends ValidationRule {
  readonly minLength: number;
  readonly maxLength: number;

  constructor(
    validationType: ValidationType,
    messageId: string,
    minLength: number,
    maxLength: number
  ) {
    super(validationType, messageId);
    this.minLength = minLength;
    this.maxLength = maxLength;
  }
}
