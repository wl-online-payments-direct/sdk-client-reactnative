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

internal extension Decodable {
    static func getRequestObject(
        for request: NSString,
        call: String,
        resolver: @escaping RCTPromiseResolveBlock
    ) -> Self? {
        guard let dataJson = (request as String).data(using: .utf8) else {
                ResultError.dataError(object: Self.self, call: call).resolveFailure(using: resolver)
                return nil
        }

        guard let requestObject = try? JSONDecoder().decode(Self.self, from: dataJson) else {
            ResultError.decodingError(object: Self.self, input: request, call: call).resolveFailure(using: resolver)
            return nil
        }

        return requestObject
    }
}
