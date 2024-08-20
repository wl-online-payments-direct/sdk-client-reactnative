/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished,
 * uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2024 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */
 
import OnlinePaymentsKit

@objc(OnlinePaymentsSdk)
internal class SdkModule: NSObject {

    @objc(initialize:withResolver:withRejecter:)
    func initialize(
        communicatorConfiguration: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = InitializeSessionRequest.getRequestObject(
            for: communicatorConfiguration,
            call: "Initialize",
            resolver: resolve
        ) else {
            return
        }
        SdkBridge.shared.initialize(request: request, resolver: resolve)
    }

    @objc(getPublicKey:withRejecter:)
    func getPublicKey(
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        SdkBridge.shared.getPublicKey(resolver: resolve)
    }

    @objc(getIinDetails:withResolver:withRejecter:)
    func getIinDetails(
        iinDetailsRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = IinDetailsRequest.getRequestObject(
            for: iinDetailsRequest,
            call: "getIinDetails",
            resolver: resolve
        ) else {
            return
        }
        SdkBridge.shared.getIinDetails(request: request, resolver: resolve)
    }

    @objc(getBasicPaymentProducts:withResolver:withRejecter:)
    func getBasicPaymentProducts(
        paymentContextString: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let paymentContext = PaymentContext.getRequestObject(
            for: paymentContextString,
            call: "getBasicPaymentProducts",
            resolver: resolve
        ) else {
            return
        }
        SdkBridge.shared.getBasicPaymentProducts(paymentContext: paymentContext, resolver: resolve)
    }

    @objc(getPaymentProduct:withResolver:withRejecter:)
    func getPaymentProduct(
        paymentProductRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentProductRequest.getRequestObject(
            for: paymentProductRequest,
            call: "getPaymentProduct",
            resolver: resolve
        ) else {
            return
        }
        SdkBridge.shared.getPaymentProduct(request: request, resolver: resolve)
    }

    @objc(getPaymentProductNetworks:withResolver:withRejecter:)
    func getPaymentProductNetworks(
        paymentProductNetworksRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentProductNetworksRequest.getRequestObject(
            for: paymentProductNetworksRequest,
            call: "getPaymentProductNetworks",
            resolver: resolve
        ) else {
            return
        }
        SdkBridge.shared.getPaymentProductNetworks(request: request, resolver: resolve)
    }

    @objc(getCurrencyConversionQuote:withResolver:withRejecter:)
    func getCurrencyConversionQuote(
        currencyConversionRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = CurrencyConversionRequest.getRequestObject(
            for: currencyConversionRequest,
            call: "getCurrencyConversionQuote",
            resolver: resolve
        ) else {
            return
        }

        if request.partialCreditCardNumber != nil {
            SdkBridge.shared.getCurrencyConversionWithPartialCCNumber(request: request, resolver: resolve)
        } else if request.token != nil {
            SdkBridge.shared.getCurrencyConversionWithToken(request: request, resolver: resolve)
        } else {
            ResultError.invalidParameter(parameter: "partialCreditCardNumber or token").resolveFailure(using: resolve)
        }
    }

    @objc(getSurchargeCalculation:withResolver:withRejecter:)
    func getSurchargeCalculation(
        surchargeCalculationRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = SurchargeCalculationRequest.getRequestObject(
            for: surchargeCalculationRequest,
            call: "getSurchargeCalculation",
            resolver: resolve
        ) else {
            return
        }

        if request.partialCreditCardNumber != nil {
            SdkBridge.shared.getSurchargeCalculationWithPartialCCNumber(request: request, resolver: resolve)
        } else if request.token != nil {
            SdkBridge.shared.getSurchargeCalculationWithToken(request: request, resolver: resolve)
        } else {
            ResultError.invalidParameter(parameter: "partialCreditCardNumber or token").resolveFailure(using: resolve)
        }
    }

    @objc(preparePaymentRequest:withResolver:withRejecter:)
    func preparePaymentRequest(
        preparePaymentRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PreparePaymentRequest.getRequestObject(
            for: preparePaymentRequest,
            call: "preparePaymentRequest",
            resolver: resolve
        ) else {
            return
        }
        SdkBridge.shared.preparePaymentRequest(request: request, resolver: resolve)
    }
}
