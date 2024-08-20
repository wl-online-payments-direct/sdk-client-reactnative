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

package com.onlinepayments.sdk.client.reactnative.sdk.models

import com.facebook.react.bridge.Promise
import com.google.gson.Gson
import com.onlinepayments.sdk.client.reactnative.extensions.resolveResultError
import java.security.InvalidParameterException

data class ResultError(val code : String, val message: String) {
    companion object {
        private val gson = Gson()
        enum class ResultErrorCode(val id: String) {
            NOT_INITIALIZED("1"),
            MISSING_REQUEST_ARGUMENT("2"),
            MISSING_REQUIRED_ARGUMENT("3"),
            MISSING_CONTEXT("4"),
        }
        fun missingRequestArgument(promise: Promise, e: Exception?) {
          return promise.resolveResultError(
            ResultError(
              ResultErrorCode.MISSING_REQUEST_ARGUMENT.id,
              "Missing the required request argument for request : ${e?.printStackTrace()}"
            ),
            gson
          )
        }

        fun notInitialized(promise: Promise) {
          return promise.resolveResultError(
            ResultError(
              ResultErrorCode.NOT_INITIALIZED.id,
              "Session is null, did you forget to initialize it?"
            ),
            gson
          )
        }

        fun missingRequiredArgument(promise: Promise, e: InvalidParameterException? = null) {
          return promise.resolveResultError(
            ResultError(
              ResultErrorCode.MISSING_REQUIRED_ARGUMENT.id,
              "Missing a required argument in the request for method : ${e?.printStackTrace()}"
            ),
            gson
          )
        }

        fun missingContext(promise: Promise) {
          return promise.resolveResultError(
            ResultError(
              ResultErrorCode.MISSING_CONTEXT.id,
              "No context available to execute method"
            ),
            gson
          )
        }
    }
}
