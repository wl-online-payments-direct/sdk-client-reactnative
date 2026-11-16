import type {
  AccountOnFile,
  BasicPaymentProduct,
  OnlinePaymentSdk,
  PaymentContextWithAmount,
} from 'onlinepayments-sdk-client-reactnative';

// [START list-payment-products]
// This SDK has no Google Pay flow. Apple Pay (302) is already removed from the list by the SDK.
const GOOGLE_PAY_PRODUCT_ID = 320;

export interface PaymentOptions {
  storedAccounts: { accountOnFile: AccountOnFile; logo?: string }[];
  products: BasicPaymentProduct[];
}

export async function loadPaymentOptions(
  sdk: OnlinePaymentSdk,
  paymentContext: PaymentContextWithAmount
): Promise<PaymentOptions> {
  const { paymentProducts, accountsOnFile } =
    await sdk.getBasicPaymentProducts(paymentContext);

  // Accounts on file are the customer's stored cards. They are only returned when your
  // backend passed the customer's tokens to Create Session.
  const storedAccounts = accountsOnFile.map((accountOnFile) => ({
    accountOnFile, // accountOnFile.label is the display text, for example "4242 **** **** 4242"
    logo: paymentProducts.find(
      (product) => product.id === accountOnFile.paymentProductId
    )?.logo,
  }));

  const products = paymentProducts
    .filter((product) => product.id !== GOOGLE_PAY_PRODUCT_ID)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return { storedAccounts, products };
}
// [END list-payment-products]
