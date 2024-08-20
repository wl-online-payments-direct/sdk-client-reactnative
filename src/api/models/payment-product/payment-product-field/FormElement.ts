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

import type { FormElementType } from './FormElementType';
import type { PaymentProductField } from './PaymentProductField'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Represents a FormElement object that is used for determining how a {@link PaymentProductField} should be presented.
 */
export interface FormElement {
  readonly type: FormElementType;
}
