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

package com.onlinepayments.sdk.client.reactnative.validation.models

import com.onlinepayments.sdk.client.android.model.PaymentRequest
import com.onlinepayments.sdk.client.android.model.validation.ValidationErrorMessage

data class PaymentRequestFieldValidationRequest(
    val paymentRequest: PaymentRequest,
    val fieldId: String
) : ValidationRequest {
    override fun validate(): List<ValidationErrorMessage> {
        return paymentRequest.paymentProduct?.getPaymentProductFieldById(fieldId)?.validateValue(paymentRequest) ?:
            listOf(
                ValidationErrorMessage(
                    "Payment Request parsing failed and the field cannot be found on the payment request $this",
                    paymentRequest.paymentProduct.id,
                    null
                )
            )
    }
}
