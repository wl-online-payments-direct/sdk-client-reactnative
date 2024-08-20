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

import type { ErrorResponse } from '../models/errors/ErrorResponse';
import type { NativeException } from '../../models';

export class ResponseListener<T> {
  readonly success: (response: T) => void;
  readonly error: (errorResponse?: ErrorResponse) => void;
  readonly exception: (exception: NativeException) => void;

  constructor(
    success: (response: T) => void,
    error: (errorResponse?: ErrorResponse) => void,
    exception: (exception: NativeException) => void
  ) {
    this.success = success;
    this.error = error;
    this.exception = exception;
  }

  onSuccess(response: T) {
    this.success(response);
  }
  onApiError(errorResponse?: ErrorResponse) {
    this.error(errorResponse);
  }
  onException(exception: NativeException) {
    this.exception(exception);
  }
}
