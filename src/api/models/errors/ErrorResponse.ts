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

import type { ApiError } from './ApiError';
import type { Throwable } from './Throwable';

/**
 * Interface that contains more information if an API call failed due to an API related error.
 */
export interface ErrorResponse {
  readonly message: string;
  readonly apiError: ApiError;
  readonly throwable: Throwable;
}
