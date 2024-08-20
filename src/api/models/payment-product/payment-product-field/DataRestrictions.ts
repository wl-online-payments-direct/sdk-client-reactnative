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

import { ValidationRuleEmailAddress } from '../../../../validation/models/rules/ValidationRuleEmailAddress';
import { ValidationRuleExpirationDate } from '../../../../validation/models/rules/ValidationRuleExpirationDate';
import { ValidationRuleFixedList } from '../../../../validation/models/rules/ValidationRuleFixedList';
import { ValidationRuleIban } from '../../../../validation/models/rules/ValidationRuleIban';
import { ValidationRuleLength } from '../../../../validation/models/rules/ValidationRuleLength';
import { ValidationRuleLuhn } from '../../../../validation/models/rules/ValidationRuleLuhn';
import { ValidationRuleRange } from '../../../../validation/models/rules/ValidationRuleRange';
import { ValidationRuleRegularExpression } from '../../../../validation/models/rules/ValidationRuleRegularExpression';
import { ValidationRuleTermsAndConditions } from '../../../../validation/models/rules/ValidationRuleTermsAndConditions';
import { ValidationRule } from '../../../../validation/models/ValidationRule';
import { ValidationType } from '../../../../validation/models/ValidationType';

export interface DataRestrictionsJSON {
  readonly isRequired: boolean;
  readonly validationRules: ValidationRule[];
}

/**
 * Represents a DataRestrictions object that is used for validating user input.
 */
export class DataRestrictions {
  readonly isRequired: boolean;
  readonly validationRules: ValidationRule[] = [];

  constructor(json: DataRestrictionsJSON) {
    this.isRequired = json.isRequired;

    const validationRulesUntyped = json.validationRules;
    for (var validationRuleUntyped of validationRulesUntyped) {
      const typedValidationRule = this.getTypedValidationRule(
        validationRuleUntyped
      );
      this.validationRules.push(typedValidationRule);
    }
  }

  getTypedValidationRule(
    untypedValidationRule: ValidationRule
  ): ValidationRule {
    switch (untypedValidationRule.validationType) {
      case ValidationType.ExpirationDate:
        return new ValidationRuleExpirationDate(
          untypedValidationRule.validationType,
          untypedValidationRule.messageId
        );
      case ValidationType.EmailAddress:
        return new ValidationRuleEmailAddress(
          untypedValidationRule.validationType,
          untypedValidationRule.messageId
        );
      case ValidationType.FixedList: {
        const fixedListValidationRule = untypedValidationRule as
          | ValidationRuleFixedList
          | undefined;
        if (fixedListValidationRule !== undefined) {
          return new ValidationRuleFixedList(
            fixedListValidationRule.validationType,
            fixedListValidationRule.messageId,
            fixedListValidationRule.allowedValues
          );
        }
        break;
      }
      case ValidationType.Iban:
        return new ValidationRuleIban(
          untypedValidationRule.validationType,
          untypedValidationRule.messageId
        );
      case ValidationType.Length: {
        const lengthValidationRule = untypedValidationRule as
          | ValidationRuleLength
          | undefined;
        if (lengthValidationRule !== undefined) {
          return new ValidationRuleLength(
            lengthValidationRule.validationType,
            lengthValidationRule.messageId,
            lengthValidationRule.minLength,
            lengthValidationRule.maxLength
          );
        }
        break;
      }
      case ValidationType.Luhn:
        return new ValidationRuleLuhn(
          untypedValidationRule.validationType,
          untypedValidationRule.messageId
        );
      case ValidationType.Range: {
        const rangeValidationRule = untypedValidationRule as
          | ValidationRuleRange
          | undefined;
        if (rangeValidationRule !== undefined) {
          return new ValidationRuleRange(
            rangeValidationRule.validationType,
            rangeValidationRule.messageId,
            rangeValidationRule.minValue,
            rangeValidationRule.maxValue
          );
        }
        break;
      }
      case ValidationType.RegularExpression: {
        const regexValidationRule = untypedValidationRule as
          | ValidationRuleRegularExpression
          | undefined;
        if (regexValidationRule !== undefined) {
          return new ValidationRuleRegularExpression(
            regexValidationRule.validationType,
            regexValidationRule.messageId,
            regexValidationRule.regex
          );
        }
        break;
      }
      case ValidationType.TermsAndConditions:
        return new ValidationRuleTermsAndConditions(
          untypedValidationRule.validationType,
          untypedValidationRule.messageId
        );
    }

    return new ValidationRule(
      untypedValidationRule.validationType,
      untypedValidationRule.messageId
    );
  }
}
