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

import type { PaymentContext } from '../payment-context/PaymentContext';
import { PaymentProduct } from '../payment-product/PaymentProduct'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Request used to retrieve a {@link PaymentProduct} from the API.
 */
export interface PaymentProductRequest {
  productId: string;
  paymentContext: PaymentContext;
}
