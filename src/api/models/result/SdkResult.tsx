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

import type { ErrorResponse } from '../errors/ErrorResponse';
import type { Throwable } from '../errors/Throwable';
import { SdkResultStatus } from './SdkResultStatus';

export interface SdkResultJSON<T> {
  data?: T;
  error?: ErrorResponse;
  throwable?: Throwable;
}

export class SdkResult<T> {
  readonly data?: T;
  readonly error?: ErrorResponse;
  readonly throwable?: Throwable;

  constructor(json: SdkResultJSON<T>) {
    this.data = json.data;
    this.error = json.error;
    this.throwable = json.throwable;
  }

  status(): SdkResultStatus {
    if (
      this.data !== undefined &&
      this.data !== null &&
      (this.error === undefined || this.error === null)
    ) {
      return SdkResultStatus.Success;
    } else if (this.error !== undefined && this.error !== null) {
      if (
        this.error?.throwable !== undefined &&
        this.error?.throwable !== null
      ) {
        return SdkResultStatus.Exception;
      } else {
        return SdkResultStatus.ApiError;
      }
    } else {
      return SdkResultStatus.Exception;
    }
  }
}
