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

import { NativeModules } from 'react-native';
import { LINKING_ERROR } from '../constants';
import type {
  AccountOnFileCustomMaskedValueRequest,
  AccountOnFileMaskedValueRequest,
  PaymentProductFieldMaskRequest,
  PaymentRequestAllMaskedValuesRequest,
  PaymentRequestMaskedValueRequest,
} from '../masker';

class NativeMaskingCommunicator {
  readonly _nativeMasking = NativeModules.OnlinePaymentsMasking
    ? NativeModules.OnlinePaymentsMasking
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );

  applyMaskForPaymentProductField(
    request: PaymentProductFieldMaskRequest
  ): Promise<string> {
    return this._nativeMasking.applyMaskForPaymentProductField(
      JSON.stringify(request)
    );
  }

  removeMaskForPaymentProductField(
    request: PaymentProductFieldMaskRequest
  ): Promise<string> {
    return this._nativeMasking.removeMaskForPaymentProductField(
      JSON.stringify(request)
    );
  }

  maskedValueForPaymentRequest(
    request: PaymentRequestMaskedValueRequest
  ): Promise<string> {
    return this._nativeMasking.maskedValueForPaymentRequest(
      JSON.stringify(request)
    );
  }

  unmaskedValueForPaymentRequest(
    request: PaymentRequestMaskedValueRequest
  ): Promise<string> {
    return this._nativeMasking.unmaskedValueForPaymentRequest(
      JSON.stringify(request)
    );
  }

  allMaskedValuesForPaymentRequest(
    request: PaymentRequestAllMaskedValuesRequest
  ): Promise<string> {
    return this._nativeMasking.allMaskedValuesForPaymentRequest(
      JSON.stringify(request)
    );
  }

  allUnmaskedValuesForPaymentRequest(
    request: PaymentRequestAllMaskedValuesRequest
  ): Promise<string> {
    return this._nativeMasking.allUnmaskedValuesForPaymentRequest(
      JSON.stringify(request)
    );
  }

  maskedValueForAccountOnFile(
    request: AccountOnFileMaskedValueRequest
  ): Promise<string> {
    return this._nativeMasking.maskedValueForAccountOnFile(
      JSON.stringify(request)
    );
  }

  customMaskedValueForAccountOnFile(
    request: AccountOnFileCustomMaskedValueRequest
  ): Promise<string> {
    return this._nativeMasking.customMaskedValueForAccountOnFile(
      JSON.stringify(request)
    );
  }
}

export const nativeMaskingCommunicator = new NativeMaskingCommunicator();
