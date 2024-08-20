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

internal extension Encodable {
    // RCTPromiseResolveBlock cannot be extended. We can at least check if this Encodable has been resolved before.
    func toEncodedString() -> String? {
        guard let valueEncoded = try? JSONEncoder().encode(self),
              let valueAsString = String(data: valueEncoded, encoding: .utf8) else {
            return nil
        }
        return valueAsString
    }

    func resolveFailure(using resolver: @escaping RCTPromiseResolveBlock) {
        resolveResult(using: resolver, encodingType: .failure)
    }

    func resolveResult(using resolver: @escaping RCTPromiseResolveBlock, encodingType: EncodingErrorType = .success) {
        if let resultString = toEncodedString() {
            resolver(resultString)
        } else {
            self.encodingFailure(resolver: resolver, originalEncodingType: encodingType)
        }
    }

    private func encodingFailure(resolver: @escaping RCTPromiseResolveBlock, originalEncodingType: EncodingErrorType) {
        ResultError.encodingError(
            type: originalEncodingType
        ).resolveResult(
            using: resolver,
            encodingType: originalEncodingType
        )
    }
}
