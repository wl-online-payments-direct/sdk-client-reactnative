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

import type { PaymentRequest } from '../../../api/models/payment-request/PaymentRequest';
import type { PaymentProductField } from '../../../models'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Request used to validate a {@link PaymentProductField} in a {@link PaymentRequest}.
 */
export interface PaymentRequestFieldValidationRequest {
  paymentRequest: PaymentRequest;
  fieldId: string;
}
