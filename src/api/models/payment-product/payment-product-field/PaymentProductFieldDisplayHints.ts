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

import type { FormElement } from './FormElement';
import type { PreferredInputType } from './PreferredInputType';
import type { Tooltip } from './Tooltip';

/**
 * Represents a PaymentProductFieldDisplayHints object.
 */
export interface PaymentProductFieldDisplayHints {
  readonly alwaysShow: boolean;
  readonly obfuscate: boolean;
  readonly displayOrder: number;
  readonly label?: string;
  readonly placeholderLabel: string;
  readonly mask?: string;
  readonly preferredInputType?: PreferredInputType;
  readonly tooltip?: Tooltip;
  readonly formElement?: FormElement;
}
