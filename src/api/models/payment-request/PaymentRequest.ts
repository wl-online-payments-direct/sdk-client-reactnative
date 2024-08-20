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

import { PaymentRequestMasker } from '../../../masker';
import type { ValidationErrorMessage } from '../../../models';
import { PaymentRequestValidator } from '../../../validator';
import type { AccountOnFile } from '../payment-product/account-on-file/AccountOnFile';
import type { PaymentProduct } from '../payment-product/PaymentProduct';

/**
 * Contains all data required for creating a payment.
 */
export class PaymentRequest {
  paymentProduct: PaymentProduct;
  accountOnFile?: AccountOnFile;
  fieldValues: Map<string, string>;
  tokenize: boolean;

  toJSON(): Object {
    return {
      fieldValues: Object.fromEntries(this.fieldValues.entries()),
      paymentProduct: this.paymentProduct,
      accountOnFile: this.accountOnFile,
      tokenize: this.tokenize,
    };
  }

  constructor(
    paymentProduct: PaymentProduct,
    accountOnFile?: AccountOnFile,
    tokenize?: boolean
  ) {
    this.paymentProduct = paymentProduct;
    this.accountOnFile = accountOnFile;
    this.fieldValues = new Map();
    this.tokenize = tokenize ?? false;
  }

  /**
   * Validates all fields based on their value and their validation rules.
   * If a field is prefilled from the {@link AccountOnFile}, but it has been altered, it will be validated.
   * @returns a list of {@link ValidationErrorMessage}
   */
  async validate(): Promise<ValidationErrorMessage[]> {
    const validationErrorMessages =
      await PaymentRequestValidator.validatePaymentRequest(this);
    return validationErrorMessages;
  }

  /**
   * Sets the {@link value} for the {@link PaymentProductField} corresponding with the {@link fieldId}.
   * @param fieldId the id of the {@link PaymentProductField} for which the value should be set
   * @param value the value which should be set
   */
  setValue(fieldId: string, value: string) {
    this.fieldValues.set(fieldId, value);
  }

  /**
   * @param fieldId the id of the {@link PaymentProductField} for which the value should be removed
   */
  removeValue(fieldId: string) {
    this.fieldValues.delete(fieldId);
  }

  /**
   * @param fieldId the id of the {@link PaymentProductField} for which the value should be returned
   * @returns the value of the {@link PaymentProductField} corresponding with the supplied {@link fieldId}, or undefined if no value is found
   */
  getValue(fieldId: string): string | undefined {
    return this.fieldValues.get(fieldId);
  }

  /**
   * @param fieldId the id of the {@link PaymentProductField} for which the masked value should be returned
   * @returns the masked value of the {@link PaymentProductField} corresponding with the supplied {@link fieldId}
   */
  async getMaskedValue(fieldId: string): Promise<string> {
    const maskedValue = await PaymentRequestMasker.maskedValue(this, fieldId);
    return maskedValue;
  }

  /**
   * @param fieldId the id of the {@link PaymentProductField} for which the unmasked value should be returned
   * @returns the unmasked value of the {@link PaymentProductField} corresponding with the supplied {@link fieldId}
   */
  async getUnmaskedValue(fieldId: string): Promise<string> {
    const unmaskedValue = await PaymentRequestMasker.unmaskedValue(
      this,
      fieldId
    );
    return unmaskedValue;
  }

  /**
   * @returns a Map of a payment product field id and the corresponding masked value
   */
  async getMaskedValues(): Promise<Map<string, string>> {
    const allMaskedValuesMap = await PaymentRequestMasker.maskedValues(this);
    return allMaskedValuesMap;
  }

  /**
   * @returns a Map of a payment product field id and the corresponding unmasked value
   */
  async getUnmaskedValues(): Promise<Map<string, string>> {
    const allUnmaskedValuesMap =
      await PaymentRequestMasker.unmaskedValues(this);
    return allUnmaskedValuesMap;
  }
}
