# Error handling

All SDK methods that call the Client API return promises. They reject with a subclass of `SdkError`
(exported by the SDK). Each error has a `code` (`SdkErrorType`) and an optional `metadata`.

| Error | When | What to do |
|---|---|---|
| `InvalidArgumentError` | Invalid input: `encryptPaymentRequest` with a request that does not validate (`metadata.data` holds the `ValidationResult`), `setValue` on a `READ_ONLY` field, `getIinDetails` with fewer than 6 digits | Show validation errors; fix the calling code for the other cases |
| `CommunicationError` | No response, a network failure, or a response that is not JSON. `httpStatusCode` and `response` may be set | Let the customer retry |
| `ResponseError` | The Client API returned an error response. `httpStatusCode` is set; `metadata` is an `ErrorResponse` with `errorId` and `errors` | HTTP status 404: not available (the card, payment method or currency conversion offer; `getIinDetails` rejects with a 404 for an unknown card number); do not restart, tell the customer or continue without the offer. Any other status: get new session data, initialise the SDK again and restart the checkout |
| `EncryptionError` | Encryption failed | Restart the checkout |
| `ConfigurationError` | `init()` with missing session values or a `clientApiUrl` whose path is not empty or `/client` | Fix the integration |

<!-- region: handle-sdk-error -->
```ts
export type ErrorAction =
  | 'show-validation-errors' // the customer can fix the input
  | 'retry' // a network problem; the same call can be tried again
  | 'not-available' // HTTP 404: the card, payment method or currency conversion offer is not available
  | 'restart-checkout' // get new session data from your backend and initialise the SDK again
  | 'integration-error'; // a bug in the integration; fix the code

export function classifySdkError(error: unknown): ErrorAction {
  if (error instanceof InvalidArgumentError) {
    // Thrown for invalid input, for example by encryptPaymentRequest when the request does not
    // validate, or by setValue on a READ_ONLY field.
    return 'show-validation-errors';
  }
  if (error instanceof CommunicationError) {
    // No response, or a response that is not JSON. error.httpStatusCode may be set.
    return 'retry';
  }
  if (error instanceof ResponseError) {
    // The Client API returned an error, for example because the session is no longer valid.
    // Log only the error id and codes: never log payment data.
    const response = error.metadata as ErrorResponse | undefined;
    console.warn('Client API error', error.httpStatusCode, response?.errorId);
    // HTTP 404: the card, payment method or currency conversion offer is not available. Do not
    // restart: tell the customer, or continue without the offer. Any other status: the session
    // is no longer usable.
    return error.httpStatusCode === 404 ? 'not-available' : 'restart-checkout';
  }
  if (error instanceof EncryptionError) {
    return 'restart-checkout';
  }
  if (error instanceof ConfigurationError) {
    // Wrong session data or SDK setup.
    return 'integration-error';
  }
  throw error;
}
```

Rules:

- Log only `errorId`, error codes and HTTP status codes. Never log `PaymentRequest` values, form
  values or `metadata` of an `InvalidArgumentError` from `setValue`. This includes crash reporting
  tools that capture console output.
- A failed SDK call never means a payment failed or succeeded. The payment result comes only from
  your backend.
