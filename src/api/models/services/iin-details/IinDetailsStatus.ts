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

import type { IinDetailsResponse } from './IinDetailsResponse'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Enum contain all the possible statuses of a {@link IinDetailsResponse}.
 */
export enum IinDetailsStatus {
  Supported = 'SUPPORTED',
  Unknown = 'UNKNOWN',
  NotEnoughDigits = 'NOT_ENOUGH_DIGITS',
  ExistingButNotAllowed = 'EXISTING_BUT_NOT_ALLOWED',
}
