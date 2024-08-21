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

import type {
  PublicKeyListener,
  IinDetailsListener,
  BasicPaymentProductsListener,
  PaymentProductListener,
  PaymentProductNetworksListener,
  CurrencyConversionQuoteListener,
  SurchargeCalculationListener,
  PaymentRequestPreparedListener,
} from '../listeners';
import {
  type PaymentContext,
  BasicPaymentProducts,
  PaymentProduct,
} from '../models';
import type {
  InitializeSessionRequest,
  IinDetailsRequest,
  PaymentProductRequest,
  CurrencyConversionRequest,
  SurchargeCalculationRequest,
  PreparePaymentRequest,
} from '../requests';
import { nativeSDKCommunicator } from './nativeSDKCommunicator';
import { BasicPaymentProductsJSONListener } from './listeners/BasicPaymentProductsJSONListener';
import { PaymentProductJSONListener } from './listeners/PaymentProductJSONListener';

export class Session {
  readonly #_nativeSDKCommunicator = nativeSDKCommunicator;

  isInitialized: boolean = false;
  private clientSessionId: string;
  private customerId: string;
  private clientApiUrl: string;
  private assetUrl: string;
  private isEnvironmentProduction: boolean;
  private appIdentifier: string;
  private loggingEnabled: boolean;
  private sdkIdentifier = 'ReactNativeClientSDK/v1.0.1';

  constructor(sessionDetails: {
    clientSessionId: string;
    customerId: string;
    clientApiUrl: string;
    assetUrl: string;
    isEnvironmentProduction?: boolean;
    appIdentifier?: string;
    loggingEnabled?: boolean;
  }) {
    this.clientSessionId = sessionDetails.clientSessionId;
    this.customerId = sessionDetails.customerId;
    this.clientApiUrl = sessionDetails.clientApiUrl;
    this.assetUrl = sessionDetails.assetUrl;
    this.isEnvironmentProduction =
      sessionDetails.isEnvironmentProduction ?? false;
    this.appIdentifier =
      sessionDetails.appIdentifier ?? 'ReactNative/UnknownAppId';
    this.loggingEnabled = sessionDetails.loggingEnabled ?? false;

    this._initNativeSdk();
  }

  private _initNativeSdk() {
    const sessionRequest: InitializeSessionRequest = {
      clientSessionId: this.clientSessionId,
      customerId: this.customerId,
      clientApiUrl: this.clientApiUrl,
      assetUrl: this.assetUrl,
      isEnvironmentProduction: this.isEnvironmentProduction,
      appIdentifier: this.appIdentifier,
      loggingEnabled: this.loggingEnabled,
      sdkIdentifier: this.sdkIdentifier,
    };

    this.#_nativeSDKCommunicator.initialize(sessionRequest).then((value) => {
      value === 'Success'
        ? (this.isInitialized = true)
        : (this.isInitialized = false);
    });
  }

  getPublicKey(listener: PublicKeyListener) {
    this.#_nativeSDKCommunicator.listenForPublicKey(listener).executeCall();
  }

  getIinDetails(request: IinDetailsRequest, listener: IinDetailsListener) {
    this.#_nativeSDKCommunicator
      .listenForIinDetails(request, listener)
      .executeCall();
  }

  getBasicPaymentProducts(
    paymentContext: PaymentContext,
    listener: BasicPaymentProductsListener
  ) {
    this.#_nativeSDKCommunicator
      .listenForBasicPaymentProducts(
        paymentContext,
        new BasicPaymentProductsJSONListener(
          (basicPaymentProductsJSON) => {
            const basicPaymentProducts = new BasicPaymentProducts(
              basicPaymentProductsJSON
            );
            listener.onSuccess(basicPaymentProducts);
          },
          (errorResponse) => {
            listener.onApiError(errorResponse);
          },
          (exception) => {
            listener.onException(exception);
          }
        )
      )
      .executeCall();
  }

  getPaymentProduct(
    request: PaymentProductRequest,
    listener: PaymentProductListener
  ) {
    this.#_nativeSDKCommunicator
      .listenForPaymentProduct(
        request,
        new PaymentProductJSONListener(
          (paymentProductJSON) => {
            const paymentProduct = new PaymentProduct(paymentProductJSON);
            listener.onSuccess(paymentProduct);
          },
          (errorResponse) => {
            listener.onApiError(errorResponse);
          },
          (exception) => {
            listener.onException(exception);
          }
        )
      )
      .executeCall();
  }

  getPaymentProductNetworks(
    request: PaymentProductRequest,
    listener: PaymentProductNetworksListener
  ) {
    this.#_nativeSDKCommunicator
      .listenForPaymentProductNetworks(request, listener)
      .executeCall();
  }

  getCurrencyConversionQuote(
    request: CurrencyConversionRequest,
    listener: CurrencyConversionQuoteListener
  ) {
    this.#_nativeSDKCommunicator
      .listenForCurrencyConversionQuote(request, listener)
      .executeCall();
  }

  getSurchargeCalculation(
    request: SurchargeCalculationRequest,
    listener: SurchargeCalculationListener
  ) {
    this.#_nativeSDKCommunicator
      .listenForSurchargeCalculation(request, listener)
      .executeCall();
  }

  preparePaymentRequest(
    request: PreparePaymentRequest,
    listener: PaymentRequestPreparedListener
  ) {
    this.#_nativeSDKCommunicator
      .listenForPreparedPaymentRequest(request, listener)
      .executeCall();
  }
}
