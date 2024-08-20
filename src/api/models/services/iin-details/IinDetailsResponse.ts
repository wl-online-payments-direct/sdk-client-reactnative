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

import type { CardType } from './CardType';
import type { IinDetail } from './IinDetail';
import type { IinDetailsStatus } from './IinDetailsStatus';

/**
 * Represents a IinDetailsResponse object.
 */
export interface IinDetailsResponse {
  readonly status: IinDetailsStatus;
  readonly paymentProductId?: string;
  readonly countryCode?: string;
  readonly isAllowedInContext: boolean;
  readonly coBrands?: IinDetail[];
  readonly cardType: CardType;
}
