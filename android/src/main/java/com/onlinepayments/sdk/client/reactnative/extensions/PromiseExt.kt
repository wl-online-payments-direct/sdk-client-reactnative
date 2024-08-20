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

package com.onlinepayments.sdk.client.reactnative.extensions

import com.facebook.react.bridge.Promise
import com.google.gson.Gson
import com.google.gson.JsonSyntaxException
import com.onlinepayments.sdk.client.reactnative.sdk.models.Result
import com.onlinepayments.sdk.client.reactnative.sdk.models.ResultError

inline fun <reified T> Promise.letRequestOrReturnError(
  gson: Gson,
  jsonString: String,
  doWithRequest: (request: T) -> Unit
) {
    try {
        gson.fromJson(jsonString, T::class.java)?.let{
            doWithRequest(it)
        }
    } catch (e: JsonSyntaxException) {
        ResultError.missingRequestArgument(this, e)
    }
}

fun <T> Promise.resolveResult(result: Result<T>, gson: Gson) {
  resolve(gson.toJson(result))
}

fun Promise.resolveString(result: String) {
  resolve(result)
}

fun Promise.resolveResultError(error: ResultError, gson: Gson) {
    resolve(gson.toJson(error))
}
