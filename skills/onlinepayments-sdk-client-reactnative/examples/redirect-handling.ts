import { Linking } from 'react-native';
import {
  fetchPaymentStatus,
  type MerchantPaymentResponse,
} from './merchant-backend';

declare function showPaymentOutcome(
  status: MerchantPaymentResponse['status']
): void;
declare function showStatusUnknown(): void;

// [START handle-payment-result]
export async function handlePaymentResult(
  result: MerchantPaymentResponse
): Promise<void> {
  if (result.redirectUrl) {
    // For example 3-D Secure or a third-party payment page. Open the URL exactly as received:
    // do not build or change it. Your backend sets the payment's returnUrl to a deep link of
    // this app, so the customer comes back to the app afterwards.
    await Linking.openURL(result.redirectUrl);
    return;
  }

  // The status comes from your backend. The app never decides that a payment succeeded.
  showPaymentOutcome(result.status);
}
// [END handle-payment-result]

// [START handle-return-deep-link]
// Register once, for example in the checkout screen's useEffect. Returns the cleanup function.
export function listenForPaymentReturn(returnUrlPrefix: string): () => void {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (url.startsWith(returnUrlPrefix)) {
      // Do not read the outcome from the URL: ask your backend for the status.
      fetchPaymentStatus()
        .then((result) => showPaymentOutcome(result.status))
        // The outcome is unknown, not failed: let the customer check the order later.
        .catch(() => showStatusUnknown());
    }
  });
  return () => subscription.remove();
}
// [END handle-return-deep-link]

// [START handle-return-cold-start]
// If the app was closed while the customer was on the 3-D Secure page, the deep link starts the
// app and no 'url' event fires. Check the start URL once when the checkout screen opens.
// getInitialURL keeps returning the same URL while the app runs, so only act on it when your app
// recorded that a payment is waiting for its result (store an order id, never card data).
export async function checkPaymentReturnOnStart(
  returnUrlPrefix: string,
  hasPaymentWaitingForResult: boolean
): Promise<void> {
  if (!hasPaymentWaitingForResult) {
    return;
  }

  const initialUrl = await Linking.getInitialURL();
  if (initialUrl?.startsWith(returnUrlPrefix)) {
    try {
      const result = await fetchPaymentStatus();
      showPaymentOutcome(result.status);
    } catch {
      showStatusUnknown(); // the outcome is unknown, not failed
    }
  }
}
// [END handle-return-cold-start]
