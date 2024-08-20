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

import { NativeModules } from 'react-native';
import { LINKING_ERROR } from '../constants';
import type { BasicPaymentProductsJSON } from './models/payment-product/BasicPaymentProducts';
import type { PaymentProductJSON } from './models/payment-product/PaymentProduct';
import { NativePromise } from './models/result/NativePromise';
import type { BasicPaymentProductsJSONListener } from './listeners/BasicPaymentProductsJSONListener';
import type { PaymentProductJSONListener } from './listeners/PaymentProductJSONListener';
import type {
  PublicKeyListener,
  IinDetailsListener,
  PaymentProductNetworksListener,
  CurrencyConversionQuoteListener,
  SurchargeCalculationListener,
  PaymentRequestPreparedListener,
} from '../listeners';
import type {
  PublicKey,
  IinDetailsResponse,
  PaymentContext,
  PaymentProductNetworks,
  CurrencyConversion,
  SurchargeCalculation,
  PreparedPaymentRequest,
} from '../models';
import type {
  InitializeSessionRequest,
  IinDetailsRequest,
  PaymentProductRequest,
  PaymentProductNetworksRequest,
  CurrencyConversionRequest,
  SurchargeCalculationRequest,
  PreparePaymentRequest,
} from '../requests';

class NativeSDKCommunicator {
  readonly _nativeSDK = NativeModules.OnlinePaymentsSdk
    ? NativeModules.OnlinePaymentsSdk
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );

  initialize(sessionRequest: InitializeSessionRequest): Promise<string> {
    return this._nativeSDK.initialize(JSON.stringify(sessionRequest));
  }

  listenForPublicKey(listener: PublicKeyListener): NativePromise<PublicKey> {
    return new NativePromise(this._nativeSDK.getPublicKey(), listener);
  }

  listenForIinDetails(
    request: IinDetailsRequest,
    listener: IinDetailsListener
  ): NativePromise<IinDetailsResponse> {
    return new NativePromise(
      this._nativeSDK.getIinDetails(JSON.stringify(request)),
      listener
    );
  }

  listenForBasicPaymentProducts(
    paymentContext: PaymentContext,
    listener: BasicPaymentProductsJSONListener
  ): NativePromise<BasicPaymentProductsJSON> {
    return new NativePromise(
      this._nativeSDK.getBasicPaymentProducts(JSON.stringify(paymentContext)),
      listener
    );
  }

  listenForPaymentProduct(
    request: PaymentProductRequest,
    listener: PaymentProductJSONListener
  ): NativePromise<PaymentProductJSON> {
    return new NativePromise(
      this._nativeSDK.getPaymentProduct(JSON.stringify(request)),
      listener
    );
  }

  listenForPaymentProductNetworks(
    request: PaymentProductNetworksRequest,
    listener: PaymentProductNetworksListener
  ): NativePromise<PaymentProductNetworks> {
    return new NativePromise(
      this._nativeSDK.getPaymentProductNetworks(JSON.stringify(request)),
      listener
    );
  }

  listenForCurrencyConversionQuote(
    request: CurrencyConversionRequest,
    listener: CurrencyConversionQuoteListener
  ): NativePromise<CurrencyConversion> {
    return new NativePromise(
      this._nativeSDK.getCurrencyConversionQuote(JSON.stringify(request)),
      listener
    );
  }

  listenForSurchargeCalculation(
    request: SurchargeCalculationRequest,
    listener: SurchargeCalculationListener
  ): NativePromise<SurchargeCalculation> {
    return new NativePromise(
      this._nativeSDK.getSurchargeCalculation(JSON.stringify(request)),
      listener
    );
  }

  listenForPreparedPaymentRequest(
    request: PreparePaymentRequest,
    listener: PaymentRequestPreparedListener
  ): NativePromise<PreparedPaymentRequest> {
    return new NativePromise(
      this._nativeSDK.preparePaymentRequest(JSON.stringify(request.toJSON())),
      listener
    );
  }
}

export const nativeSDKCommunicator = new NativeSDKCommunicator();
