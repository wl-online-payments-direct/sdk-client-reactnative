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

@objc(OnlinePaymentsValidation)
internal class ValidationModule: NSObject {

    @objc(validatePaymentRequest:withResolver:withRejecter:)
    func validatePaymentRequest(
        paymentRequestValidationRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentRequestValidationRequest.getRequestObject(
            for: paymentRequestValidationRequest,
            call: "validatePaymentRequest",
            resolver: resolve
        ) else {
            return
        }

        let validationErrorsString = getValidationErrorsAsString(request: request)
        resolve(validationErrorsString)
    }

    @objc(validatePaymentProductFieldForPaymentRequest:withResolver:withRejecter:)
    func validatePaymentProductFieldForPaymentRequest(
        paymentRequestFieldValidationRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentRequestFieldValidationRequest.getRequestObject(
            for: paymentRequestFieldValidationRequest,
            call: "validatePaymentProductFieldForPaymentRequest",
            resolver: resolve
        ) else {
            return
        }

        let validationErrorsString = getValidationErrorsAsString(request: request)
        resolve(validationErrorsString)
    }

    @objc(validateValueForPaymentProductField:withResolver:withRejecter:)
    func validateValueForPaymentProductField(
        paymentProductFieldValidationRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentProductFieldValidationRequest.getRequestObject(
            for: paymentProductFieldValidationRequest,
            call: "validateValueForPaymentProductField",
            resolver: resolve
        ) else {
            return
        }

        let validationErrorsString = getValidationErrorsAsString(request: request)
        resolve(validationErrorsString)
    }

    @objc(validateValueForValidationRule:withResolver:withRejecter:)
    func validateValueForValidationRule(
        ruleValidationRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = RuleValidationRequest.getRequestObject(
            for: ruleValidationRequest,
            call: "validateValueForValidationRule",
            resolver: resolve
        ) else {
            return
        }

        let validationErrorsString = getValidationErrorsAsString(request: request)
        resolve(validationErrorsString)
    }

    @objc(validateValidationRuleForFieldOfPaymentRequest:withResolver:withRejecter:)
    func validateValidationRuleForFieldOfPaymentRequest(
        paymentRequestFieldRuleValidationRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentRequestFieldRuleValidationRequest.getRequestObject(
            for: paymentRequestFieldRuleValidationRequest,
            call: "validateValidationRuleForFieldOfPaymentRequest",
            resolver: resolve
        ) else {
            return
        }

        let validationErrorsString = getValidationErrorsAsString(request: request)
        resolve(validationErrorsString)
    }

    private func getValidationErrorsAsString(request: ValidationRequest) -> String {
        let validationErrors = request.validate()
        return validationErrors.toEncodedString() ?? "Could not convert ValidationErrors to String"
    }
}
