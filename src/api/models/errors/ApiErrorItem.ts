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

import type { ApiError } from './ApiError'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * If an API error occurred during an API call, this object might be available on {@link ApiError} and contains more information about the error that occurred.
 */
export interface ApiErrorItem {
  readonly errorCode: string;
  readonly category?: string;
  readonly httpStatusCode?: number;
  readonly id?: string;
  readonly message: string;
  readonly propertyName?: string;
  readonly retriable?: boolean;
}
