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

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Promise
import com.google.gson.Gson
import com.onlinepayments.sdk.client.android.exception.EncryptDataException
import com.onlinepayments.sdk.client.android.listener.BasicPaymentProductsResponseListener
import com.onlinepayments.sdk.client.android.listener.CurrencyConversionResponseListener
import com.onlinepayments.sdk.client.android.listener.IinLookupResponseListener
import com.onlinepayments.sdk.client.android.listener.PaymentProductNetworkResponseListener
import com.onlinepayments.sdk.client.android.listener.PaymentProductResponseListener
import com.onlinepayments.sdk.client.android.listener.PaymentRequestPreparedListener
import com.onlinepayments.sdk.client.android.listener.PublicKeyResponseListener
import com.onlinepayments.sdk.client.android.listener.SurchargeCalculationResponseListener
import com.onlinepayments.sdk.client.android.model.AmountOfMoney
import com.onlinepayments.sdk.client.android.model.PaymentContext
import com.onlinepayments.sdk.client.android.model.PaymentProductNetworkResponse
import com.onlinepayments.sdk.client.android.model.PreparedPaymentRequest
import com.onlinepayments.sdk.client.android.model.PublicKeyResponse
import com.onlinepayments.sdk.client.android.model.api.ErrorResponse
import com.onlinepayments.sdk.client.android.model.currencyconversion.CurrencyConversionResponse
import com.onlinepayments.sdk.client.android.model.iin.IinDetailsResponse
import com.onlinepayments.sdk.client.android.model.paymentproduct.BasicPaymentProducts
import com.onlinepayments.sdk.client.android.model.paymentproduct.PaymentProduct
import com.onlinepayments.sdk.client.android.model.surcharge.response.SurchargeCalculationResponse
import com.onlinepayments.sdk.client.android.session.Session
import com.onlinepayments.sdk.client.reactnative.extensions.resolveResult
import com.onlinepayments.sdk.client.reactnative.sdk.models.IinDetailsRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.InitializeSessionRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.PaymentProductNetworksRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.PaymentProductRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.PreparePaymentRequest
import com.onlinepayments.sdk.client.reactnative.sdk.models.Result
import com.onlinepayments.sdk.client.reactnative.sdk.models.ResultError

class SdkBridge {
  private val gson = Gson()
  private var session : Session? = null
    set(value) {
      Log.w(TAG, "Setting session to $value")
      field = value
    }

  companion object {
    private const val TAG = "SDKBridge"
    private var instance : SdkBridge? = null

    fun getInstance() : SdkBridge {
      return instance ?: SdkBridge().apply {
        instance = this
      }
    }
  }

  fun isSessionInitialized() : Boolean {
    return session != null
  }

  fun initializeSession(
    request: InitializeSessionRequest,
    promise: Promise
  ) {
    session =
      Session(
          request.clientSessionId,
          request.customerId,
          request.clientApiUrl,
          request.assetUrl,
          request.isEnvironmentProduction,
          request.appIdentifier,
          request.loggingEnabled,
          request.sdkIdentifier
      )

      promise.resolve("Success")
  }

  fun getPublicKey(
    context: Context,
    promise: Promise
  ) {
    session?.getPublicKey(context, object : PublicKeyResponseListener {
      override fun onSuccess(response: PublicKeyResponse) {
        val sdkResult = Result(data = response)
        promise.resolveResult<PublicKeyResponse>(sdkResult, gson)
      }

      override fun onApiError(error: ErrorResponse) {
        val sdkResult = Result<PublicKeyResponse>(error = error)
        promise.resolveResult<PublicKeyResponse>(sdkResult, gson)
      }

      override fun onException(t: Throwable) {
        val sdkResult = Result<PublicKeyResponse>(throwable = t)
        promise.resolveResult<PublicKeyResponse>(sdkResult, gson)
      }
    }) ?: ResultError.notInitialized(promise)
  }

  fun getIinDetails(
    context: Context,
    promise: Promise,
    request: IinDetailsRequest
  ) {
    session?.getIinDetails(
      context,
      request.partialCreditCardNumber,
      object : IinLookupResponseListener {
        override fun onSuccess(response: IinDetailsResponse) {
          val sdkResult = Result(data = response)
          promise.resolveResult<IinDetailsResponse>(sdkResult, gson)
        }

        override fun onApiError(error: ErrorResponse) {
          val sdkResult = Result<IinDetailsResponse>(error = error)
          promise.resolveResult<IinDetailsResponse>(sdkResult, gson)
        }

        override fun onException(t: Throwable) {
          val sdkResult = Result<IinDetailsResponse>(throwable = t)
          promise.resolveResult<IinDetailsResponse>(sdkResult, gson)
        }
      },
      request.paymentContext
    ) ?: ResultError.notInitialized(promise)
  }

  fun getBasicPaymentProducts(
    context: Context,
    promise: Promise,
    paymentContext: PaymentContext
  ) {
    session?.getBasicPaymentProducts(
      context,
      paymentContext,
      object : BasicPaymentProductsResponseListener {
        override fun onSuccess(response: BasicPaymentProducts) {
          val sdkResult = Result(data = response)
          promise.resolveResult<BasicPaymentProducts>(sdkResult, gson)
        }

        override fun onApiError(error: ErrorResponse) {
          val sdkResult = Result<BasicPaymentProducts>(error = error)
          promise.resolveResult<BasicPaymentProducts>(sdkResult, gson)
        }

        override fun onException(t: Throwable) {
          val sdkResult = Result<BasicPaymentProducts>(throwable = t)
          promise.resolveResult<BasicPaymentProducts>(sdkResult, gson)
        }
      }
    ) ?: ResultError.notInitialized(promise)
  }

  fun getPaymentProduct(
    context: Context,
    promise: Promise,
    request: PaymentProductRequest
  ) {
    session?.getPaymentProduct(
      context,
      request.productId,
      request.paymentContext,
      object : PaymentProductResponseListener {
        override fun onSuccess(response: PaymentProduct) {
          val sdkResult = Result(data = response)
          promise.resolveResult<PaymentProduct>(sdkResult, gson)
        }

        override fun onApiError(error: ErrorResponse) {
          val sdkResult = Result<PaymentProduct>(error = error)
          promise.resolveResult<PaymentProduct>(sdkResult, gson)
        }

        override fun onException(t: Throwable) {
          val sdkResult = Result<PaymentProduct>(throwable = t)
          promise.resolveResult<PaymentProduct>(sdkResult, gson)
        }
      }
    ) ?: ResultError.notInitialized(promise)
  }

  fun getPaymentProductNetworks(
    context: Context,
    promise: Promise,
    request: PaymentProductNetworksRequest
  ) {
    session?.getNetworksForPaymentProduct(
      request.productId,
      context,
      request.paymentContext,
      object : PaymentProductNetworkResponseListener {
        override fun onSuccess(response: PaymentProductNetworkResponse) {
          val sdkResult = Result(data = response)
          promise.resolveResult<PaymentProductNetworkResponse>(sdkResult, gson)
        }

        override fun onApiError(error: ErrorResponse) {
          val sdkResult = Result<PaymentProductNetworkResponse>(error = error)
          promise.resolveResult<PaymentProductNetworkResponse>(sdkResult, gson)
        }

        override fun onException(t: Throwable) {
          val sdkResult = Result<PaymentProductNetworkResponse>(throwable = t)
          promise.resolveResult<PaymentProductNetworkResponse>(sdkResult, gson)
        }
      }
    ) ?: ResultError.notInitialized(promise)
  }

  fun getCurrencyConversionWithPartialCCNumber(
    context: Context,
    promise: Promise,
    amountOfMoney: AmountOfMoney,
    partialCreditCardNumber: String,
    paymentProductId: Int?
  ) {
    session?.getCurrencyConversionQuote(
      context,
      amountOfMoney,
      partialCreditCardNumber,
      paymentProductId,
      object : CurrencyConversionResponseListener {
        override fun onSuccess(response: CurrencyConversionResponse) {
          val sdkResult = Result(data = response)
          promise.resolveResult<CurrencyConversionResponse>(sdkResult, gson)
        }

        override fun onApiError(error: ErrorResponse) {
          val sdkResult = Result<CurrencyConversionResponse>(error = error)
          promise.resolveResult<CurrencyConversionResponse>(sdkResult, gson)
        }

        override fun onException(t: Throwable) {
          val sdkResult = Result<CurrencyConversionResponse>(throwable = t)
          promise.resolveResult<CurrencyConversionResponse>(sdkResult, gson)
        }
      }
    ) ?: ResultError.notInitialized(promise)
  }

  fun getCurrencyConversionWithToken(
    context: Context,
    promise: Promise,
    amountOfMoney: AmountOfMoney,
    token: String
  ) {
    session?.getCurrencyConversionQuote(
      context,
      amountOfMoney,
      token,
      object : CurrencyConversionResponseListener {
        override fun onSuccess(response: CurrencyConversionResponse) {
          val sdkResult = Result(data = response)
          promise.resolveResult<CurrencyConversionResponse>(sdkResult, gson)
        }

        override fun onApiError(error: ErrorResponse) {
          val sdkResult = Result<CurrencyConversionResponse>(error = error)
          promise.resolveResult<CurrencyConversionResponse>(sdkResult, gson)
        }

        override fun onException(t: Throwable) {
          val sdkResult = Result<CurrencyConversionResponse>(throwable = t)
          promise.resolveResult<CurrencyConversionResponse>(sdkResult, gson)
        }
      }
    ) ?: ResultError.notInitialized(promise)
  }

  fun getSurchargeCalculationWithPartialCCNumber(
    context: Context,
    promise: Promise,
    amountOfMoney: AmountOfMoney,
    partialCreditCardNumber: String,
    paymentProductId: Int?
  ) {
    session?.getSurchargeCalculation(
      context,
      amountOfMoney,
      partialCreditCardNumber,
      paymentProductId,
      object : SurchargeCalculationResponseListener {
        override fun onSuccess(response: SurchargeCalculationResponse) {
          val sdkResult = Result(data = response)
          promise.resolveResult<SurchargeCalculationResponse>(sdkResult, gson)
        }

        override fun onApiError(error: ErrorResponse) {
          val sdkResult = Result<SurchargeCalculationResponse>(error = error)
          promise.resolveResult<SurchargeCalculationResponse>(sdkResult, gson)
        }

        override fun onException(t: Throwable) {
          val sdkResult = Result<SurchargeCalculationResponse>(throwable = t)
          promise.resolveResult<SurchargeCalculationResponse>(sdkResult, gson)
        }
      }
    ) ?: ResultError.notInitialized(promise)
  }

  fun getSurchargeCalculationWithToken(
    context: Context,
    promise: Promise,
    amountOfMoney: AmountOfMoney,
    token: String
  ) {
    session?.getSurchargeCalculation(
      context,
      amountOfMoney,
      token,
      object : SurchargeCalculationResponseListener {
        override fun onSuccess(response: SurchargeCalculationResponse) {
          val sdkResult = Result(data = response)
          promise.resolveResult<SurchargeCalculationResponse>(sdkResult, gson)
        }

        override fun onApiError(error: ErrorResponse) {
          val sdkResult = Result<SurchargeCalculationResponse>(error = error)
          promise.resolveResult<SurchargeCalculationResponse>(sdkResult, gson)
        }

        override fun onException(t: Throwable) {
          val sdkResult = Result<SurchargeCalculationResponse>(throwable = t)
          promise.resolveResult<SurchargeCalculationResponse>(sdkResult, gson)
        }
      }
    ) ?: ResultError.notInitialized(promise)
  }

  fun preparePaymentRequest(
    context: Context,
    promise: Promise,
    request: PreparePaymentRequest
  ) {
    session?.preparePaymentRequest(
      request.paymentRequest,
      context,
      object : PaymentRequestPreparedListener {
        override fun onPaymentRequestPrepared(response: PreparedPaymentRequest) {
          val sdkResult = Result(data = response)
          promise.resolveResult<PreparedPaymentRequest>(sdkResult, gson)
        }

        override fun onFailure(error: EncryptDataException) {
          val sdkResult = Result<PreparedPaymentRequest>(error = ErrorResponse(error.localizedMessage))
          promise.resolveResult<PreparedPaymentRequest>(sdkResult, gson)
        }
      }
    ) ?: ResultError.notInitialized(promise)
  }
}

