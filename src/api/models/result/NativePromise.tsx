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

import { NativeException } from '../errors/NativeException';
import type { ResponseListener } from '../../listeners/ResponseListener';
import { SdkResult, type SdkResultJSON } from './SdkResult';
import { SdkResultStatus } from './SdkResultStatus';

export class NativePromise<T> {
  private call: Promise<string>;
  private listener: ResponseListener<T>;

  constructor(call: Promise<string>, listener: ResponseListener<T>) {
    this.call = call;
    this.listener = listener;
  }

  executeCall() {
    this.call
      .then((response) => {
        const result = this.parseResult(response);
        const resultStatus = result.status();

        switch (resultStatus) {
          case SdkResultStatus.Success: {
            const data = result.data;
            if (data !== undefined && data !== null) {
              this.listener.onSuccess(data);
            } else {
              this.listener.onException(
                new NativeException('No data available for successful call')
              );
            }
            break;
          }
          case SdkResultStatus.ApiError: {
            this.listener.onApiError(result.error);
            break;
          }
          case SdkResultStatus.Exception: {
            this.listener.onException(
              NativeException.fromThrowable(
                result.throwable ?? {
                  message: 'Exception status without throwable',
                }
              )
            );
            break;
          }
        }
      })
      .catch(() => {
        this.listener.onException(
          new NativeException('Something went wrong executing the call.')
        );
      });
  }

  private parseResult(response: string): SdkResult<T> {
    const jsonObject = JSON.parse(response) as SdkResultJSON<T>;
    const object = new SdkResult<T>(jsonObject);
    return object;
  }
}
