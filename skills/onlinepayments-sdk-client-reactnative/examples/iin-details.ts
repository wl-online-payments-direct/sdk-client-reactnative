import {
  IinDetailStatus,
  ResponseError,
  type OnlinePaymentSdk,
  type PaymentContextWithAmount,
} from 'onlinepayments-sdk-client-reactnative';

// [START iin-details]
export type CardDetection =
  | { kind: 'too-short' }
  | {
      kind: 'supported';
      paymentProductId: number;
      coBrandProductIds: number[];
    }
  | { kind: 'not-allowed' } // known card, but not accepted for this payment
  | { kind: 'unknown' };

export async function detectCard(
  sdk: OnlinePaymentSdk,
  cardNumberInput: string,
  paymentContext: PaymentContextWithAmount
): Promise<CardDetection> {
  const digits = cardNumberInput.replace(/\D/g, '');

  // getIinDetails throws an InvalidArgumentError below 6 digits, so do not call it earlier.
  if (digits.length < 6) {
    return { kind: 'too-short' };
  }

  try {
    // The SDK sends only the first 6 or 8 digits.
    const response = await sdk.getIinDetails(digits, paymentContext);

    if (
      response.status === IinDetailStatus.EXISTING_BUT_NOT_ALLOWED ||
      !response.paymentProductId
    ) {
      return { kind: 'not-allowed' };
    }

    // Co-branded cards: let the customer choose the brand among the allowed ones.
    const coBrandProductIds = (response.coBrands ?? [])
      .filter((coBrand) => coBrand.isAllowedInContext)
      .map((coBrand) => coBrand.paymentProductId);

    return {
      kind: 'supported',
      paymentProductId: response.paymentProductId,
      coBrandProductIds,
    };
  } catch (error) {
    // HTTP 404: no payment product of your account matches the card number. Any other error,
    // for example an expired session, is handled by classifySdkError.
    if (error instanceof ResponseError && error.httpStatusCode === 404) {
      return { kind: 'unknown' };
    }
    throw error;
  }
}
// [END iin-details]
