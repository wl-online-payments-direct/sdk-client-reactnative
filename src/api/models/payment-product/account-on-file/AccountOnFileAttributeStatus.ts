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

import type { AccountOnFileAttribute } from './AccountOnFileAttribute'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Enum containing all the possible statuses for an {@link AccountOnFileAttribute}.
 */
export enum AccountOnFileAttributeStatus {
  ReadOnly = 'READ_ONLY',
  CanWrite = 'CAN_WRITE',
  MustWrite = 'MUST_WRITE',
}

export namespace AccountOnFileAttributeStatus {
  /**
   * Function that returns whether an {@link AccountOnFileAttribute} can be edited based on its {@link AccountOnFileAttributeStatus}.
   */
  export function isEditingAllowed(
    status: AccountOnFileAttributeStatus
  ): boolean {
    switch (status) {
      case AccountOnFileAttributeStatus.ReadOnly:
        return false;
      default:
        return true;
    }
  }
}
