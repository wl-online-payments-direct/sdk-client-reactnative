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

import React

struct ResultError: Encodable {
    let code: String
    let message: String

    static func sessionNotInitialized() -> ResultError {
        return ResultError(
            code: ResultErrorCode.sessionNotInitialized.rawValue,
            message: "Session is nil. Please initialize the session first"
        )
    }

    static func invalidParameter(parameter: String) -> ResultError {
        return ResultError(
            code: ResultErrorCode.invalidParameter.rawValue,
            message: "The following parameter is invalid or missing : \(parameter)"
        )
    }

    static func dataError<T: Decodable>(object: T.Type, call: String) -> ResultError {
        return ResultError(
            code: ResultErrorCode.dataError.rawValue,
            message: "Could not create Data object of \(object.self) for request : \(call)"
        )
    }

    static func decodingError<T: Decodable>(object: T.Type, input: NSString, call: String) -> ResultError {
        return ResultError(
            code: ResultErrorCode.decodingError.rawValue,
            message: "Could not decode input \(input) to \(object.self) in call : \(call)"
        )
    }

    static func encodingError(type: EncodingErrorType) -> ResultError {
        return ResultError(
            code: ResultErrorCode.encodingError.rawValue,
            message: "Could not encode \(type) to String"
        )
    }
}

enum ResultErrorCode: String {
    case sessionNotInitialized = "1"
    case invalidParameter = "2"
    case dataError = "3"
    case decodingError = "4"
    case encodingError = "5"
}

enum EncodingErrorType {
    case success
    case failure
    case apiFailure
    case maskedValuesDictionary
    case unmaskedValuesDictionary
    case validationErrors
}
