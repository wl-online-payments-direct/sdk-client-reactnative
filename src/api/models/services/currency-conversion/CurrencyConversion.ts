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

import type { CurrencyConversionResult } from './CurrencyConversionResult';
import type { DccProposal } from './DccProposal';

/**
 * Represents a CurrencyConversion object.
 */
export interface CurrencyConversion {
  readonly dccSessionId: string;
  readonly result: CurrencyConversionResult;
  readonly proposal: DccProposal;
}
