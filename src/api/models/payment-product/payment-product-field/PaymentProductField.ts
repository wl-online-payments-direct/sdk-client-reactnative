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

import { PaymentProductFieldMasker } from '../../../../masker';
import type { ValidationErrorMessage } from '../../../../models';
import {
  PaymentProductFieldValidator,
  PaymentRequestValidator,
} from '../../../../validator';
import type { PaymentRequest } from '../../payment-request/PaymentRequest';
import {
  DataRestrictions,
  type DataRestrictionsJSON,
} from './DataRestrictions';
import type { PaymentProductFieldDisplayHints } from './PaymentProductFieldDisplayHints';
import type { PaymentProductFieldType } from './PaymentProductFieldType';

export interface PaymentProductFieldJSON {
  id: string;
  type: PaymentProductFieldType;
  displayHints?: PaymentProductFieldDisplayHints;
  dataRestrictions: DataRestrictionsJSON;
}

/**
 * Represents a PaymentProductField object.
 */
export class PaymentProductField {
  readonly id: string;
  readonly type: PaymentProductFieldType;
  readonly displayHints?: PaymentProductFieldDisplayHints;
  readonly dataRestrictions: DataRestrictions;
  readonly errorMessageIds: ValidationErrorMessage[] = [];

  constructor(readonly json: PaymentProductFieldJSON) {
    this.id = json.id;
    this.type = json.type;
    this.displayHints = json.displayHints;
    this.dataRestrictions = new DataRestrictions(json.dataRestrictions);
  }

  /**
   * @param value which should be validated
   * @returns a list of {@link ValidationErrorMessage} for the supplied {@link value}. If the list is empty, you can assume that the supplied {@link value} is a valid value.
   */
  async validateValue(value: string): Promise<ValidationErrorMessage[]> {
    const validationErrorMessages =
      await PaymentProductFieldValidator.validateValueForPaymentProductField(
        value,
        this
      );
    return validationErrorMessages;
  }

  /**
   * @param request for which the field value which should be validated
   * @returns a list of {@link ValidationErrorMessage} for the field's value in the supplied {@link request}. If the list is empty, you can assume that the field value is a valid value.
   */
  async validateValueForPaymentRequest(
    request: PaymentRequest
  ): Promise<ValidationErrorMessage[]> {
    const validationErrorMessages =
      await PaymentRequestValidator.validatePaymentProductFieldForPaymentRequest(
        this.id,
        request
      );
    return validationErrorMessages;
  }

  /**
   * @param value which should be masked
   * @returns the masked {@link value} of the {@link PaymentProductField}.
   */
  async applyMask(value: string): Promise<string> {
    const maskedValue = await PaymentProductFieldMasker.applyMask(this, value);
    return maskedValue;
  }

  /**
   * @param value which should be unmasked
   * @returns the unmasked {@link value} of the {@link PaymentProductField}.
   */
  async removeMask(value: string): Promise<string> {
    const unmaskedValue = await PaymentProductFieldMasker.removeMask(
      this,
      value
    );
    return unmaskedValue;
  }
}
