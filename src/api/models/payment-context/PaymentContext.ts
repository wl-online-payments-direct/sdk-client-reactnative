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

import type { AmountOfMoney } from './AmountOfMoney';

/**
 * Contains information about a payment, like its {@link AmountOfMoney} and countryCode.
 */
export interface PaymentContext {
  amountOfMoney: AmountOfMoney;
  /**
   * Country code of the Country where the transaction will take place, should match the {@link https://www.iso.org/iso-3166-country-codes.html|ISO-3166-alpha-2 standard}
   */
  countryCode: string;
  isRecurring: boolean;
}
