/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { afterAll, beforeAll, vi } from 'vitest';
import { ValidationRuleExpirationDate } from '../../../../src/domain/validation/rules/ValidationRuleExpirationDate';
import { createValidationRuleTest } from './helpers/create-validation-rule-test';

// Freeze time so expiry-date boundary tests remain deterministic regardless of when they run.
const FROZEN_DATE = new Date('2025-06-15T12:00:00Z');
const FROZEN_YEAR = FROZEN_DATE.getUTCFullYear(); // 2025
const FROZEN_MONTH_2 = '06'; // June, zero-padded

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FROZEN_DATE);
});

afterAll(() => {
  vi.useRealTimers();
});

// Current month/year in MMYY and MMYYYY formats (valid — not expired)
const validExpireDate4Digits = `${FROZEN_MONTH_2}${String(FROZEN_YEAR).slice(-2)}`; // '0625'
const validExpireDate6Digits = `${FROZEN_MONTH_2}${FROZEN_YEAR}`; // '062025'

// Exactly at the 25-year limit (valid boundary)
const maxValidExpireDate = `12${FROZEN_YEAR + 25}`; // '122050'

// One month beyond the 25-year limit (invalid)
const beyondMaxExpireDate = `01${FROZEN_YEAR + 26}`; // '012051'

const rule = new ValidationRuleExpirationDate();

createValidationRuleTest(rule, [
  {
    msg: 'should fail validation when no value is set',
    isValid: false,
  },
  {
    msg: 'should pass validation with an expire date of 4 digits (MMYY) for current date',
    isValid: true,
    value: validExpireDate4Digits,
  },
  {
    msg: 'should pass validation with an expire date of 6 digits (MMYYYY) for current date',
    isValid: true,
    value: validExpireDate6Digits,
  },
  {
    msg: 'should fail validation with an expire date set in the past',
    isValid: false,
    value: '0122',
  },
  {
    msg: 'should fail validation with an invalid date format',
    isValid: false,
    value: '12345',
  },
  {
    msg: 'should pass validation with an expire date at the 25-year limit',
    isValid: true,
    value: maxValidExpireDate,
  },
  {
    msg: 'should fail validation with an expire date beyond the maximum of 25 years',
    isValid: false,
    value: beyondMaxExpireDate,
  },
]);
