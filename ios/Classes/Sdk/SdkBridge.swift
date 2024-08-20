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
 
import Foundation
import OnlinePaymentsKit

internal class SdkBridge {
    static private let TAG = "SdkBridge"
    static let shared = SdkBridge()
    private init() {}
    private var session: Session?

    func isSessionInitialized() -> Bool {
        return session != nil
    }

    func initialize(
        request: InitializeSessionRequest,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        self.session =
            Session(
                clientSessionId: request.clientSessionId,
                customerId: request.customerId,
                baseURL: request.clientApiUrl,
                assetBaseURL: request.assetUrl,
                appIdentifier: request.appIdentifier,
                loggingEnabled: request.loggingEnabled,
                sdkIdentifier: request.sdkIdentifier
            )
        resolver("Success")
    }

    func getPublicKey(
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        session?.publicKey(
            success: { publicKeyResponse in
                self.forwardSuccessResult(
                    object: PublicKeyResponse.self,
                    dataObject: publicKeyResponse,
                    resolver: resolver
                )
            },
            failure: { error in
                self.forwardFailureResult(
                    object: PublicKeyResponse.self,
                    throwable: Throwable(message: error.localizedDescription),
                    resolver: resolver
                )
            },
            apiFailure: { errorResponse in
                self.forwardApiFailureResult(
                    object: PublicKeyResponse.self,
                    errorResponse: errorResponse,
                    resolver: resolver
                )
            }
        ) ?? ResultError.sessionNotInitialized().resolveFailure(using: resolver)
    }

    func getIinDetails(
        request: IinDetailsRequest,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        session?.iinDetails(
            forPartialCreditCardNumber: request.partialCreditCardNumber,
            context: request.paymentContext,
            success: { iiNDetailsResponse in
                self.forwardSuccessResult(
                    object: IINDetailsResponse.self,
                    dataObject: iiNDetailsResponse,
                    resolver: resolver
                )
            },
            failure: { error in
                self.forwardFailureResult(
                    object: IINDetailsResponse.self,
                    throwable: Throwable(message: error.localizedDescription),
                    resolver: resolver
                )
            },
            apiFailure: { errorResponse in
                self.forwardApiFailureResult(
                    object: IINDetailsResponse.self,
                    errorResponse: errorResponse,
                    resolver: resolver
                )
            }
        ) ?? ResultError.sessionNotInitialized().resolveFailure(using: resolver)
    }

    func getBasicPaymentProducts(
        paymentContext: PaymentContext,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        session?.paymentProducts(
            for: paymentContext,
            success: { paymentProducts in
                self.forwardSuccessResult(
                    object: BasicPaymentProducts.self,
                    dataObject: paymentProducts,
                    resolver: resolver
                )
            },
            failure: { error in
                self.forwardFailureResult(
                    object: BasicPaymentProducts.self,
                    throwable: Throwable(message: error.localizedDescription),
                    resolver: resolver
                )
            },
            apiFailure: { errorResponse in
                self.forwardApiFailureResult(
                    object: BasicPaymentProducts.self,
                    errorResponse: errorResponse,
                    resolver: resolver
                )
            }
        ) ?? ResultError.sessionNotInitialized().resolveFailure(using: resolver)
    }

    func getPaymentProduct(
        request: PaymentProductRequest,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        session?.paymentProduct(
            withId: request.productId,
            context: request.paymentContext,
            success: { paymentProduct in
                self.forwardSuccessResult(
                    object: PaymentProduct.self,
                    dataObject: paymentProduct,
                    resolver: resolver
                )
            },
            failure: { error in
                self.forwardFailureResult(
                    object: PaymentProduct.self,
                    throwable: Throwable(message: error.localizedDescription),
                    resolver: resolver
                )
            },
            apiFailure: { errorResponse in
                self.forwardApiFailureResult(
                    object: PaymentProduct.self,
                    errorResponse: errorResponse,
                    resolver: resolver
                )
            }
        ) ?? ResultError.sessionNotInitialized().resolveFailure(using: resolver)
    }

    func getPaymentProductNetworks(
        request: PaymentProductNetworksRequest,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        session?.paymentProductNetworks(
            forProductId: request.productId,
            context: request.paymentContext,
            success: { paymentProductNetworks in
                self.forwardSuccessResult(
                    object: PaymentProductNetworks.self,
                    dataObject: paymentProductNetworks,
                    resolver: resolver
                )
            },
            failure: { error in
                self.forwardFailureResult(
                    object: PaymentProductNetworks.self,
                    throwable: Throwable(message: error.localizedDescription),
                    resolver: resolver
                )
            },
            apiFailure: { errorResponse in
                self.forwardApiFailureResult(
                    object: PaymentProductNetworks.self,
                    errorResponse: errorResponse,
                    resolver: resolver
                )
            }
        ) ?? ResultError.sessionNotInitialized().resolveFailure(using: resolver)
    }

    func getCurrencyConversionWithPartialCCNumber(
        request: CurrencyConversionRequest,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        guard let partialCreditCardNumber = request.partialCreditCardNumber else {
            ResultError.invalidParameter(parameter: "partialCreditCardNumber").resolveFailure(using: resolver)
            return
        }

        session?.currencyConversionQuote(
            amountOfMoney: request.amountOfMoney,
            partialCreditCardNumber: partialCreditCardNumber,
            paymentProductId: request.paymentProductId as NSNumber?,
            success: { currencyConversionResponse in
                self.forwardSuccessResult(
                    object: CurrencyConversionResponse.self,
                    dataObject: currencyConversionResponse,
                    resolver: resolver
                )
            },
            failure: { error in
                self.forwardFailureResult(
                    object: CurrencyConversionResponse.self,
                    throwable: Throwable(message: error.localizedDescription),
                    resolver: resolver
                )
            },
            apiFailure: { errorResponse in
                self.forwardApiFailureResult(
                    object: CurrencyConversionResponse.self,
                    errorResponse: errorResponse,
                    resolver: resolver
                )
            }
        ) ?? ResultError.sessionNotInitialized().resolveFailure(using: resolver)
    }

    func getCurrencyConversionWithToken(
        request: CurrencyConversionRequest,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        guard let token = request.token else {
            ResultError.invalidParameter(parameter: "token").resolveFailure(using: resolver)
            return
        }

        session?.currencyConversionQuote(
            amountOfMoney: request.amountOfMoney,
            token: token,
            success: { currencyConversionResponse in
                self.forwardSuccessResult(
                    object: CurrencyConversionResponse.self,
                    dataObject: currencyConversionResponse,
                    resolver: resolver
                )
            },
            failure: { error in
                self.forwardFailureResult(
                    object: CurrencyConversionResponse.self,
                    throwable: Throwable(message: error.localizedDescription),
                    resolver: resolver
                )
            },
            apiFailure: { errorResponse in
                self.forwardApiFailureResult(
                    object: CurrencyConversionResponse.self,
                    errorResponse: errorResponse,
                    resolver: resolver
                )
            }
        ) ?? ResultError.sessionNotInitialized().resolveFailure(using: resolver)
    }

    func getSurchargeCalculationWithPartialCCNumber(
        request: SurchargeCalculationRequest,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        guard let partialCreditCardNumber = request.partialCreditCardNumber else {
            ResultError.invalidParameter(parameter: "partialCreditCardNumber").resolveFailure(using: resolver)
            return
        }

        session?.surchargeCalculation(
            amountOfMoney: request.amountOfMoney,
            partialCreditCardNumber: partialCreditCardNumber,
            paymentProductId: request.paymentProductId as NSNumber?,
            success: { surchargeCalculationResponse in
                self.forwardSuccessResult(
                    object: SurchargeCalculationResponse.self,
                    dataObject: surchargeCalculationResponse,
                    resolver: resolver
                )
            },
            failure: { error in
                self.forwardFailureResult(
                    object: SurchargeCalculationResponse.self,
                    throwable: Throwable(message: error.localizedDescription),
                    resolver: resolver
                )
            },
            apiFailure: { errorResponse in
                self.forwardApiFailureResult(
                    object: SurchargeCalculationResponse.self,
                    errorResponse: errorResponse,
                    resolver: resolver
                )
            }
        ) ?? ResultError.sessionNotInitialized().resolveFailure(using: resolver)
    }

    func getSurchargeCalculationWithToken(
        request: SurchargeCalculationRequest,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        guard let token = request.token else {
            ResultError.invalidParameter(parameter: "token").resolveFailure(using: resolver)
            return
        }

        session?.surchargeCalculation(
            amountOfMoney: request.amountOfMoney,
            token: token,
            success: { surchargeCalculationResponse in
                self.forwardSuccessResult(
                    object: SurchargeCalculationResponse.self,
                    dataObject: surchargeCalculationResponse,
                    resolver: resolver
                )
            },
            failure: { error in
                self.forwardFailureResult(
                    object: SurchargeCalculationResponse.self,
                    throwable: Throwable(message: error.localizedDescription),
                    resolver: resolver
                )
            },
            apiFailure: { errorResponse in
                self.forwardApiFailureResult(
                    object: SurchargeCalculationResponse.self,
                    errorResponse: errorResponse,
                    resolver: resolver
                )
            }
        ) ?? ResultError.sessionNotInitialized().resolveFailure(using: resolver)
    }

    func preparePaymentRequest(request: PreparePaymentRequest, resolver: @escaping RCTPromiseResolveBlock) {
        session?.prepare(
            request.paymentRequest,
            success: { preparedPaymentRequest in
                self.forwardSuccessResult(
                    object: PreparedPaymentRequest.self,
                    dataObject: preparedPaymentRequest,
                    resolver: resolver
                )
            },
            failure: { error in
                self.forwardFailureResult(
                    object: PreparedPaymentRequest.self,
                    throwable: Throwable(message: error.localizedDescription),
                    resolver: resolver
                )
            },
            apiFailure: { errorResponse in
                self.forwardApiFailureResult(
                    object: PreparedPaymentRequest.self,
                    errorResponse: errorResponse,
                    resolver: resolver
                )
            }
        ) ?? ResultError.sessionNotInitialized().resolveFailure(using: resolver)
    }

    private func forwardSuccessResult<T: Encodable>(
        object: T.Type,
        dataObject: T,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        let sdkResult = Result<T>(data: dataObject, error: nil, throwable: nil)
        sdkResult.resolveResult(using: resolver)
    }

    private func forwardFailureResult<T: Encodable>(
        object: T.Type,
        throwable: Throwable,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        let sdkResult = Result<T>(data: nil, error: nil, throwable: throwable)
        sdkResult.resolveFailure(using: resolver)
    }

    private func forwardApiFailureResult<T: Encodable>(
        object: T.Type,
        errorResponse: ErrorResponse,
        resolver: @escaping RCTPromiseResolveBlock
    ) {
        let sdkResult = Result<T>(data: nil, error: errorResponse, throwable: nil)
        sdkResult.resolveResult(using: resolver, encodingType: .apiFailure)
    }
}
