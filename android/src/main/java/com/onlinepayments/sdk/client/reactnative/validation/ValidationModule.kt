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

package com.onlinepayments.sdk.client.reactnative.validation

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.gson.GsonBuilder
import com.onlinepayments.sdk.client.reactnative.extensions.letRequestOrReturnError
import com.onlinepayments.sdk.client.reactnative.extensions.resolveString
import com.onlinepayments.sdk.client.reactnative.validation.models.PaymentRequestValidationRequest
import com.onlinepayments.sdk.client.reactnative.validation.models.PaymentRequestFieldValidationRequest
import com.onlinepayments.sdk.client.reactnative.validation.models.PaymentProductFieldValidationRequest
import com.onlinepayments.sdk.client.reactnative.validation.models.ValidationRequest
import com.onlinepayments.sdk.client.reactnative.validation.models.RuleValidationRequest
import com.onlinepayments.sdk.client.reactnative.validation.models.PaymentRequestFieldRuleValidationRequest
import com.onlinepayments.sdk.client.reactnative.adapters.ValidationRuleAdapter
import com.onlinepayments.sdk.client.android.model.validation.ValidationErrorMessage
import com.onlinepayments.sdk.client.android.model.validation.AbstractValidationRule

class ValidationModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val gson = GsonBuilder()
    .registerTypeAdapter(AbstractValidationRule::class.java, ValidationRuleAdapter())
    .create()

  companion object {
    const val NAME = "OnlinePaymentsValidation"
  }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun validatePaymentRequest(paymentRequestValidationRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(
      gson,
      paymentRequestValidationRequest
    ) { request: PaymentRequestValidationRequest ->
      resolveValidationRequest(request, promise)
    }
  }

  @ReactMethod
  fun validatePaymentProductFieldForPaymentRequest(paymentRequestFieldValidationRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(
      gson,
      paymentRequestFieldValidationRequest
    ) { request: PaymentRequestFieldValidationRequest ->
      resolveValidationRequest(request, promise)
    }
  }

  @ReactMethod
  fun validateValueForPaymentProductField(paymentProductFieldValidationRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(
      gson,
      paymentProductFieldValidationRequest
    ) { request: PaymentProductFieldValidationRequest ->
      resolveValidationRequest(request, promise)
    }
  }

  @ReactMethod
  fun validateValueForValidationRule(ruleValidationRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(
      gson,
      ruleValidationRequest
    ) { request: RuleValidationRequest ->
      resolveValidationRequest(request, promise)
    }
  }

  @ReactMethod
  fun validateValidationRuleForFieldOfPaymentRequest(
    paymentRequestFieldRuleValidationRequest: String,
    promise: Promise
  ) {
    promise.letRequestOrReturnError(
      gson,
      paymentRequestFieldRuleValidationRequest
    ) { request: PaymentRequestFieldRuleValidationRequest ->
      resolveValidationRequest(request, promise)
    }
  }

  private fun <T: ValidationRequest> resolveValidationRequest(request: T, promise: Promise) {
    val validationErrorMessages = request.validate()
    promise.resolveString(gson.toJson(validationErrorMessages))
  }
}
