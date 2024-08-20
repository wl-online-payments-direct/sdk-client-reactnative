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

package com.onlinepayments.sdk.client.reactnative.masking

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.gson.Gson
import com.onlinepayments.sdk.client.reactnative.extensions.letRequestOrReturnError
import com.onlinepayments.sdk.client.reactnative.extensions.resolveString
import com.onlinepayments.sdk.client.reactnative.masking.models.AccountOnFileMaskedValueRequest
import com.onlinepayments.sdk.client.reactnative.masking.models.AccountOnFileCustomMaskedValueRequest
import com.onlinepayments.sdk.client.reactnative.masking.models.PaymentProductFieldMaskRequest
import com.onlinepayments.sdk.client.reactnative.masking.models.PaymentRequestMaskedValueRequest
import com.onlinepayments.sdk.client.reactnative.masking.models.PaymentRequestAllMaskedValuesRequest

class MaskingModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val gson = Gson()

  companion object {
    const val NAME = "OnlinePaymentsMasking"
  }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun applyMaskForPaymentProductField(paymentProductFieldMaskRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(gson, paymentProductFieldMaskRequest) { request: PaymentProductFieldMaskRequest ->
      val field = request.field
      val value = request.value

      val maskedValue = field.applyMask(value)
      promise.resolveString(maskedValue)
    }
  }

  @ReactMethod
  fun removeMaskForPaymentProductField(paymentProductFieldMaskRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(gson, paymentProductFieldMaskRequest) { request: PaymentProductFieldMaskRequest ->
      val field = request.field
      val value = request.value

      val unmaskedValue = field.removeMask(value)
      promise.resolveString(unmaskedValue)
    }
  }

  @ReactMethod
  fun maskedValueForPaymentRequest(paymentRequestMaskedValueRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(
      gson,
      paymentRequestMaskedValueRequest
    ) { request: PaymentRequestMaskedValueRequest ->
      val paymentRequest = request.request
      val fieldId = request.fieldId

      val maskedValue = paymentRequest.getMaskedValue(fieldId)
      promise.resolveString(maskedValue)
    }
  }

  @ReactMethod
  fun unmaskedValueForPaymentRequest(paymentRequestMaskedValueRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(
      gson,
      paymentRequestMaskedValueRequest
    ) { request: PaymentRequestMaskedValueRequest ->
      val paymentRequest = request.request
      val fieldId = request.fieldId

      val unmaskedValue = paymentRequest.getUnmaskedValue(fieldId)
      promise.resolveString(unmaskedValue)
    }
  }

  @ReactMethod
  fun allMaskedValuesForPaymentRequest(paymentRequestAllMaskedValuesRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(
      gson,
      paymentRequestAllMaskedValuesRequest
    ) { request: PaymentRequestAllMaskedValuesRequest ->
      val paymentRequest = request.request

      val allMaskedValues = gson.toJson(paymentRequest.getMaskedValues())
      promise.resolveString(allMaskedValues)
    }
  }

  @ReactMethod
  fun allUnmaskedValuesForPaymentRequest(paymentRequestAllMaskedValuesRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(
      gson,
      paymentRequestAllMaskedValuesRequest
    ) { request: PaymentRequestAllMaskedValuesRequest ->
      val paymentRequest = request.request

      val allUnmaskedValues = gson.toJson(paymentRequest.getUnmaskedValues())
      promise.resolveString(allUnmaskedValues)
    }
  }

  @ReactMethod
  fun maskedValueForAccountOnFile(accountOnFileMaskedValueRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(
      gson,
      accountOnFileMaskedValueRequest
    ) { request: AccountOnFileMaskedValueRequest ->
      val accountOnFile = request.accountOnFile
      val fieldId = request.fieldId

      val maskedValue = accountOnFile.getMaskedValue(fieldId)
      promise.resolveString(maskedValue)
    }
  }

  @ReactMethod
  fun customMaskedValueForAccountOnFile(accountOnFileCustomMaskedValueRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(
      gson,
      accountOnFileCustomMaskedValueRequest
    ) { request: AccountOnFileCustomMaskedValueRequest ->
      val accountOnFile = request.accountOnFile
      val fieldId = request.fieldId
      val mask = request.mask

      val customMaskedValue = accountOnFile.getMaskedValue(fieldId, mask)
      promise.resolveString(customMaskedValue)
    }
  }
}
