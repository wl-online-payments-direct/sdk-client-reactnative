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

import { PaymentProductField } from './PaymentProductField'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Enum containing all the possible types how a {@link PaymentProductField} can be presented.
 */
export enum FormElementType {
  Text = 'text',
  List = 'list',
  Currency = 'currency',
  Date = 'date',
  Boolean = 'boolean',
}
