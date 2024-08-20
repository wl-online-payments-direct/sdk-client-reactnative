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

import {
  BasicPaymentProduct,
  type BasicPaymentProductJSON,
} from './BasicPaymentProduct';
import {
  PaymentProductField,
  type PaymentProductFieldJSON,
} from './payment-product-field/PaymentProductField';

export interface PaymentProductJSON extends BasicPaymentProductJSON {
  readonly fields: PaymentProductFieldJSON[];
}

/**
 * Represents a {@link BasicPaymentProduct} and its {@link PaymentProductField}s.
 */
export class PaymentProduct extends BasicPaymentProduct {
  readonly fields: PaymentProductField[] = [];

  constructor(json: PaymentProductJSON) {
    super(json);
    for (var fieldJSON of json.fields) {
      this.fields.push(new PaymentProductField(fieldJSON));
    }
  }

  /**
   * @param id for which the {@link PaymentProductField} should be returned
   * @returns the {@link PaymentProductField} corresponding with the provided {@link id}, or {@link undefined} if not found
   */
  getPaymentProductFieldById(id: string): PaymentProductField | undefined {
    for (var field of this.fields) {
      if (field.id === id) {
        return field;
      }
    }
    return undefined;
  }
}
