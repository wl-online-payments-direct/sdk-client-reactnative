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

@objc(OnlinePaymentsMasking)
internal class MaskingModule: NSObject {

    @objc(applyMaskForPaymentProductField:withResolver:withRejecter:)
    func applyMaskForPaymentProductField(
        paymentProductFieldMaskRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentProductFieldMaskRequest.getRequestObject(
            for: paymentProductFieldMaskRequest,
            call: "applyMaskForPaymentProductField",
            resolver: resolve
        ) else {
            return
        }

        let field = request.field
        let value = request.value

        let maskedValue = field.applyMask(value: value)
        resolve(maskedValue)
    }

    @objc(removeMaskForPaymentProductField:withResolver:withRejecter:)
    func removeMaskForPaymentProductField(
        paymentProductFieldMaskRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentProductFieldMaskRequest.getRequestObject(
            for: paymentProductFieldMaskRequest,
            call: "removeMaskForPaymentProductField",
            resolver: resolve
        ) else {
            return
        }

        let field = request.field
        let value = request.value

        let unmaskedValue = field.removeMask(value: value)
        resolve(unmaskedValue)
    }

    @objc(maskedValueForPaymentRequest:withResolver:withRejecter:)
    func maskedValueForPaymentRequest(
        paymentRequestMaskedValueRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentRequestMaskedValueRequest.getRequestObject(
            for: paymentRequestMaskedValueRequest,
            call: "maskedValueForPaymentRequest",
            resolver: resolve
        ) else {
            return
        }

        let paymentRequest = request.request
        let fieldId = request.fieldId

        let maskedValue = paymentRequest.maskedValue(forField: fieldId)
        resolve(maskedValue)
    }

    @objc(unmaskedValueForPaymentRequest:withResolver:withRejecter:)
    func unmaskedValueForPaymentRequest(
        paymentRequestUnmaskedValueRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentRequestMaskedValueRequest.getRequestObject(
            for: paymentRequestUnmaskedValueRequest,
            call: "unmaskedValueForPaymentRequest",
            resolver: resolve
        ) else {
            return
        }

        let paymentRequest = request.request
        let fieldId = request.fieldId

        let unmaskedValue = paymentRequest.unmaskedValue(forField: fieldId)
        resolve(unmaskedValue)
    }

    @objc(allMaskedValuesForPaymentRequest:withResolver:withRejecter:)
    func allMaskedValuesForPaymentRequest(
        paymentRequestAllMaskedValuesRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentRequestAllMaskedValuesRequest.getRequestObject(
            for: paymentRequestAllMaskedValuesRequest,
            call: "allMaskedValuesForPaymentRequest",
            resolver: resolve
        ) else {
            return
        }

        let paymentRequest = request.request

        guard let allMaskedValues = paymentRequest.maskedFieldValues else {
            resolve(nil)
            return
        }

        allMaskedValues.resolveResult(using: resolve)
    }

    @objc(allUnmaskedValuesForPaymentRequest:withResolver:withRejecter:)
    func allUnmaskedValuesForPaymentRequest(
        paymentRequestAllUnmaskedValuesRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = PaymentRequestAllMaskedValuesRequest.getRequestObject(
            for: paymentRequestAllUnmaskedValuesRequest,
            call: "allUnmaskedValuesForPaymentRequest",
            resolver: resolve
        ) else {
            return
        }

        let paymentRequest = request.request

        guard let allUnmaskedValues = paymentRequest.unmaskedFieldValues else {
            resolve(nil)
            return
        }

        allUnmaskedValues.resolveResult(using: resolve)
    }

    @objc(maskedValueForAccountOnFile:withResolver:withRejecter:)
    func maskedValueForAccountOnFile(
        accountOnFileMaskedValueRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = AccountOnFileMaskedValueRequest.getRequestObject(
            for: accountOnFileMaskedValueRequest,
            call: "maskedValueForAccountOnFile",
            resolver: resolve
        ) else {
            return
        }

        let accountOnFile = request.accountOnFile
        let fieldId = request.fieldId

        let maskedValue = accountOnFile.maskedValue(forField: fieldId)
        resolve(maskedValue)
    }

    @objc(customMaskedValueForAccountOnFile:withResolver:withRejecter:)
    func customMaskedValueForAccountOnFile(
        accountOnFileCustomMaskedValueRequest: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let request = AccountOnFileCustomMaskedValueRequest.getRequestObject(
            for: accountOnFileCustomMaskedValueRequest,
            call: "customMaskedValueForAccountOnFile",
            resolver: resolve
        ) else {
            return
        }

        let accountOnFile = request.accountOnFile
        let fieldId = request.fieldId
        let mask = request.mask

        let customMaskedValue = accountOnFile.maskedValue(forField: fieldId, mask: mask)
        resolve(customMaskedValue)
    }
}
