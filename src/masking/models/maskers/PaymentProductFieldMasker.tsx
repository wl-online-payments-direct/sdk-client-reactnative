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

import type { PaymentProductField } from '../../../api/models/payment-product/payment-product-field/PaymentProductField';
import { nativeMaskingCommunicator } from '../../nativeMaskingCommunicator';
import type { PaymentProductFieldMaskRequest } from '../../../masker';

export class PaymentProductFieldMasker {
  static async applyMask(
    field: PaymentProductField,
    value: string
  ): Promise<string> {
    const applyMaskRequest: PaymentProductFieldMaskRequest = {
      field,
      value,
    };
    const maskedValue =
      await nativeMaskingCommunicator.applyMaskForPaymentProductField(
        applyMaskRequest
      );
    return maskedValue;
  }

  static async removeMask(
    field: PaymentProductField,
    value: string
  ): Promise<string> {
    const removeMaskRequest: PaymentProductFieldMaskRequest = {
      field,
      value,
    };
    const unmaskedValue =
      await nativeMaskingCommunicator.removeMaskForPaymentProductField(
        removeMaskRequest
      );
    return unmaskedValue;
  }
}
