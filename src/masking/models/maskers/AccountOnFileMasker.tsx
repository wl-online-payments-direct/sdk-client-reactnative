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

import type { AccountOnFile } from '../../../api//models/payment-product/account-on-file/AccountOnFile';
import { nativeMaskingCommunicator } from '../../nativeMaskingCommunicator';
import type {
  AccountOnFileCustomMaskedValueRequest,
  AccountOnFileMaskedValueRequest,
} from '../../../masker';

export class AccountOnFileMasker {
  static async maskedValue(
    aof: AccountOnFile,
    fieldId: string
  ): Promise<string> {
    const maskedValueRequest: AccountOnFileMaskedValueRequest = {
      accountOnFile: aof,
      fieldId,
    };
    const maskedValue =
      await nativeMaskingCommunicator.maskedValueForAccountOnFile(
        maskedValueRequest
      );
    return maskedValue;
  }

  static async customMaskedValue(
    aof: AccountOnFile,
    fieldId: string,
    mask: string
  ): Promise<string> {
    const customMaskedValueRequest: AccountOnFileCustomMaskedValueRequest = {
      accountOnFile: aof,
      fieldId,
      mask,
    };
    const customMaskedValue =
      await nativeMaskingCommunicator.customMaskedValueForAccountOnFile(
        customMaskedValueRequest
      );
    return customMaskedValue;
  }
}
