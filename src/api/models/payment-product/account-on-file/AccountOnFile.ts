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

import { AccountOnFileMasker } from '../../../../masker';
import type { AccountOnFileAttribute } from './AccountOnFileAttribute';
import type { AccountOnFileDisplayHints } from './AccountOnFileDisplayHints';

export interface AccountOnFileJSON {
  id: string;
  paymentProductId: string;
  displayHints?: AccountOnFileDisplayHints;
  attributes?: AccountOnFileAttribute[];
  label?: string;
}

/**
 * Represents an AccountOnFile object.
 */
export class AccountOnFile {
  readonly id: string;
  readonly paymentProductId: string;
  readonly displayHints?: AccountOnFileDisplayHints;
  readonly attributes: AccountOnFileAttribute[];
  private _label?: string;

  constructor(readonly json: AccountOnFileJSON) {
    this.id = json.id;
    this.paymentProductId = json.paymentProductId;
    this.displayHints = json.displayHints;
    this.attributes = json.attributes ?? [];
    this._label = json.label;
  }

  /**
   * Returns the label which can be displayed on an {@link AccountOnFile} selection screen.
   */
  getLabel(): string {
    if (this._label !== undefined) {
      return this._label;
    }

    const template = this.displayHints?.labelTemplate[0];
    if (template !== undefined && template !== null) {
      for (var attribute of this.attributes) {
        if (template.attributeKey === attribute.key) {
          this._label = attribute.value;
          return this._label;
        }
      }
    }
    return '';
  }

  /**
   * @param fieldId id of the {@link PaymentProductField} for which the masked value should be returned
   * @returns the masked value for the given payment product field
   */
  async getMaskedValue(fieldId: string): Promise<string> {
    const maskedValue = await AccountOnFileMasker.maskedValue(this, fieldId);
    return maskedValue;
  }

  /**
   * @param fieldId id of the {@link PaymentProductField} for which the masked value should be returned
   * @param mask the mask which should be applied to the value
   * @returns the value of the given payment product field with a custom mask applied
   */
  async getMaskedValueWithCustomMask(
    fieldId: string,
    mask: string
  ): Promise<string> {
    const customMaskedValue = await AccountOnFileMasker.customMaskedValue(
      this,
      fieldId,
      mask
    );
    return customMaskedValue;
  }
}
