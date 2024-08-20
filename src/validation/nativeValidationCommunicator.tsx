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
  PaymentRequestFieldRuleValidationRequest,
  PaymentProductFieldValidationRequest,
  PaymentRequestFieldValidationRequest,
  PaymentRequestValidationRequest,
  RuleValidationRequest,
} from '../validator';

class NativeValidationCommunicator {
  readonly _nativeValidation = NativeModules.OnlinePaymentsValidation
    ? NativeModules.OnlinePaymentsValidation
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );

  validatePaymentRequest(
    request: PaymentRequestValidationRequest
  ): Promise<string> {
    return this._nativeValidation.validatePaymentRequest(
      JSON.stringify(request)
    );
  }

  validatePaymentProductFieldForPaymentRequest(
    request: PaymentRequestFieldValidationRequest
  ): Promise<string> {
    return this._nativeValidation.validatePaymentProductFieldForPaymentRequest(
      JSON.stringify(request)
    );
  }

  validateValueForPaymentProductField(
    request: PaymentProductFieldValidationRequest
  ): Promise<string> {
    return this._nativeValidation.validateValueForPaymentProductField(
      JSON.stringify(request)
    );
  }

  validateValueForValidationRule(
    request: RuleValidationRequest
  ): Promise<string> {
    return this._nativeValidation.validateValueForValidationRule(
      JSON.stringify(request)
    );
  }

  validateValidationRuleForFieldOfPaymentRequest(
    request: PaymentRequestFieldRuleValidationRequest
  ): Promise<string> {
    return this._nativeValidation.validateValidationRuleForFieldOfPaymentRequest(
      JSON.stringify(request)
    );
  }
}

export const nativeValidationCommunicator = new NativeValidationCommunicator();
