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

package com.onlinepayments.sdk.client.reactnative.sdk

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.gson.Gson
import com.onlinepayments.sdk.client.android.model.PaymentContext
import com.onlinepayments.sdk.client.reactnative.extensions.letRequestOrReturnError
import com.onlinepayments.sdk.client.reactnative.sdk.models.CurrencyConversionRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.IinDetailsRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.InitializeSessionRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.PaymentProductNetworksRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.PaymentProductRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.PreparePaymentRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.ResultError
import com.onlinepayments.sdk.client.reactnative.sdk.models.SurchargeCalculationRequest

class SdkModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val bridge get() = SdkBridge.getInstance()

  private val gson = Gson()

  companion object {
    const val NAME = "OnlinePaymentsSdk"
  }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun initialize(communicatorConfiguration: String, promise: Promise) {
    promise.letRequestOrReturnError(gson, communicatorConfiguration) { request : InitializeSessionRequest ->
      bridge.initializeSession(request, promise)
    }
  }

  @ReactMethod
  fun getPublicKey(promise: Promise) {
    if (!bridge.isSessionInitialized()) {
      return ResultError.notInitialized(promise)
    }

    bridge.getPublicKey(reactContext, promise)
  }

  @ReactMethod
  fun getIinDetails(iinDetailsRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(gson, iinDetailsRequest) { request: IinDetailsRequest ->
      if (!bridge.isSessionInitialized()) {
        return ResultError.notInitialized(promise)
      }

      bridge.getIinDetails(reactContext, promise, request)
    }
  }

  @ReactMethod
  fun getBasicPaymentProducts(paymentContextString: String, promise: Promise) {
    promise.letRequestOrReturnError(gson, paymentContextString) { paymentContext: PaymentContext ->
      if (!bridge.isSessionInitialized()) {
        return ResultError.notInitialized(promise)
      }

      bridge.getBasicPaymentProducts(reactContext, promise, paymentContext)
    }
  }

  @ReactMethod
  fun getPaymentProduct(paymentProductRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(gson, paymentProductRequest) { request: PaymentProductRequest ->
      if (!bridge.isSessionInitialized()) {
        return ResultError.notInitialized(promise)
      }

      bridge.getPaymentProduct(reactContext, promise, request)
    }
  }

  @ReactMethod
  fun getPaymentProductNetworks(paymentProductNetworksRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(gson, paymentProductNetworksRequest) { request: PaymentProductNetworksRequest ->
      if (!bridge.isSessionInitialized()) {
        return ResultError.notInitialized(promise)
      }

      bridge.getPaymentProductNetworks(reactContext, promise, request)
    }
  }

  @ReactMethod
  fun getCurrencyConversionQuote(currencyConversionRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(gson, currencyConversionRequest) { request: CurrencyConversionRequest ->
      if (!bridge.isSessionInitialized()) {
        return ResultError.notInitialized(promise)
      }

      if (request.partialCreditCardNumber != null) {
        bridge.getCurrencyConversionWithPartialCCNumber(
          reactContext,
          promise,
          request.amountOfMoney,
          request.partialCreditCardNumber,
          request.paymentProductId
        )
      } else if (request.token != null) {
        bridge.getCurrencyConversionWithToken(
          reactContext,
          promise,
          request.amountOfMoney,
          request.token
        )
      } else {
        return ResultError.missingRequestArgument(promise, null)
      }
    }
  }

  @ReactMethod
  fun getSurchargeCalculation(surchargeCalculationRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(gson, surchargeCalculationRequest) { request: SurchargeCalculationRequest ->
      if (!bridge.isSessionInitialized()) {
        return ResultError.notInitialized(promise)
      }

      if (request.partialCreditCardNumber != null) {
        bridge.getSurchargeCalculationWithPartialCCNumber(
          reactContext,
          promise,
          request.amountOfMoney,
          request.partialCreditCardNumber,
          request.paymentProductId
        )
      } else if (request.token != null) {
        bridge.getSurchargeCalculationWithToken(
          reactContext,
          promise,
          request.amountOfMoney,
          request.token
        )
      } else {
        return ResultError.missingRequestArgument(promise, null)
      }
    }
  }

  @ReactMethod
  fun preparePaymentRequest(preparePaymentRequest: String, promise: Promise) {
    promise.letRequestOrReturnError(gson, preparePaymentRequest) { request: PreparePaymentRequest ->
      if (!bridge.isSessionInitialized()) {
        return ResultError.notInitialized(promise)
      }

      bridge.preparePaymentRequest(reactContext, promise, request)
    }
  }
}
