# Checkout flows

Every code block below is copied from a file in `../examples/`. The examples call your backend
through the functions in `examples/merchant-backend.ts`; see
[react-native.md](react-native.md#your-backend) for that contract.

The examples are plain functions, not components. Call them from your screens: for example from a
`useEffect` when the checkout screen opens, from `onChangeText` and `onBlur` of a `TextInput`, and
from the pay button's `onPress`.

## 1. Initialise the SDK

Your backend creates a client session with Create Session and returns its data. Create Session's
response can be passed to `init()` as it is. Do this for every checkout.

<!-- region: initialise-sdk -->
```ts
export async function createSdk(): Promise<OnlinePaymentSdk> {
  // New session data for every checkout. Your backend creates it with Create Session.
  // The session data holds no secret: never put the API key or secret in the app.
  const sessionData = await fetchSessionData();

  // init() throws a ConfigurationError when a value is missing or clientApiUrl has a
  // path other than "" or "/client".
  return init(sessionData, { appIdentifier: 'MyShopApp/1.0.0' });
}
```

## 2. Build the payment context

The payment context is passed to most SDK calls. The payment products, surcharge and currency
conversion depend on it, so it must match the order.

<!-- region: payment-context -->
```ts
export function createPaymentContext(order: {
  totalInMinorUnits: number;
  currencyCode: string;
  countryCode: string;
}): PaymentContextWithAmount {
  // Use the real values of the order being paid: the payment products, surcharge and
  // currency conversion returned by the SDK depend on them.
  return {
    countryCode: order.countryCode, // ISO 3166-1 alpha-2, for example 'NL'
    amountOfMoney: {
      amount: order.totalInMinorUnits, // in the smallest unit of the currency: 1298 = EUR 12.98
      currencyCode: order.currencyCode, // ISO 4217, for example 'EUR'
    },
    isRecurring: false,
  };
}
```

`PaymentContextWithAmount` (amount required) is needed by `getIinDetails`. It can be used for all
other calls too.

## 3. List payment products and stored cards

`getBasicPaymentProducts` returns the payment products available for this context and the
customer's accounts on file (stored cards). Accounts on file are only returned when your backend
passed the customer's tokens to Create Session.

The SDK already removes Apple Pay (302) and products it cannot process. It does not remove Google
Pay (320), which this SDK cannot process either, so filter it out.

<!-- region: list-payment-products -->
```ts
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
```

## 4. Render the payment form

When the customer selects a product or a stored card, get the full product. It contains the fields
to render. For a stored card, pass the account on file's `paymentProductId`.

<!-- region: get-payment-product -->
```ts
export async function loadSelectedProduct(
  sdk: OnlinePaymentSdk,
  paymentContext: PaymentContextWithAmount,
  selection: { paymentProductId: number; accountOnFileId?: string }
): Promise<{ paymentProduct: PaymentProduct; accountOnFile?: AccountOnFile }> {
  const paymentProduct = await sdk.getPaymentProduct(
    selection.paymentProductId,
    paymentContext
  );
  const accountOnFile = selection.accountOnFileId
    ? paymentProduct.getAccountOnFile(selection.accountOnFileId)
    : undefined;

  return { paymentProduct, accountOnFile };
}
```

Describe the form from the product's fields, then render one `TextInput` per field. Fields of a
stored card that are `READ_ONLY` are shown with their masked value and cannot be edited.

<!-- region: describe-form-fields -->
```ts
export interface FormField {
  id: string;
  label: string;
  placeholder?: string;
  required: boolean;
  obfuscate: boolean; // render with <TextInput secureTextEntry />
  numericKeyboard: boolean; // render with keyboardType="number-pad"
  masked: boolean; // pass the field to onFieldInput: only fields with a mask are reformatted
  prefilledValue?: string; // masked value from the account on file
  readOnly: boolean; // render with editable={false}
}

// Build the form from the fields the API returns. Do not hard-code fields, masks or
// validation rules: they differ per payment product and per merchant configuration.
export function describeFormFields(
  paymentProduct: PaymentProduct,
  accountOnFile?: AccountOnFile
): FormField[] {
  return [...paymentProduct.getFields()]
    .sort((a, b) => a.getDisplayOrder() - b.getDisplayOrder())
    .map((field) => ({
      id: field.id,
      label: field.getLabel(),
      placeholder: field.getPlaceholder(),
      required: field.isRequired(),
      obfuscate: field.shouldObfuscate(),
      numericKeyboard:
        field.displayHints?.preferredInputType === 'IntegerKeyboard',
      masked: Boolean(field.displayHints?.mask),
      prefilledValue: accountOnFile?.getValue(field.id),
      readOnly: accountOnFile ? !accountOnFile.isWritable(field.id) : false,
    }));
}
```

## 5. Detect the card brand

When at least 6 digits have been entered, get the IIN details to find the payment product for the
card. Use the returned `paymentProductId` to show the brand logo and, if it differs from the
selected product, load that product with `getPaymentProduct`.

<!-- region: iin-details -->
```ts
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
```

## 6. Format and validate input

Create the `PaymentRequest` once the product is loaded, keep it for the whole checkout (for example
in a `useRef`), then set values as the customer types.

<!-- region: create-payment-request -->
```ts
export function createPaymentRequest(
  paymentProduct: PaymentProduct,
  accountOnFile: AccountOnFile | undefined,
  customerWantsToStoreCard: boolean
): PaymentRequest {
  // Ask to store the card only when the product allows it and the customer agreed.
  const tokenize =
    customerWantsToStoreCard && paymentProduct.allowsTokenization === true;

  return new PaymentRequest(paymentProduct, accountOnFile, tokenize);
}
```

<!-- region: set-field-value -->
```ts
// Call from TextInput's onChangeText. Returns the value to pass back as `value`: the masked value
// for a field with a mask, the typed text for a field without one (such as the cardholder name).
export function onFieldInput(
  paymentRequest: PaymentRequest,
  formField: FormField,
  input: string
): string {
  const field = paymentRequest.getField(formField.id);

  // setValue removes the mask before it stores the value, so "4111 1111" is stored as "41111111".
  // It throws an InvalidArgumentError for a READ_ONLY field of the selected account on file:
  // render those fields with editable={false} and never call setValue for them.
  field.setValue(input);

  // Without a mask, setValue stores the trimmed text. Returning that would delete a space as soon
  // as the customer types it, so return the typed text instead.
  if (!formField.masked) {
    return input;
  }

  return field.getMaskedValue() ?? '';
}
```

<!-- region: validate-field -->
```ts
// Call from TextInput's onBlur. Returns the messages to show under the field.
export function fieldErrors(
  paymentRequest: PaymentRequest,
  fieldId: string
): string[] {
  return paymentRequest
    .getField(fieldId)
    .validate()
    .errors.map((error) => error.errorMessage);
}
```

Before encrypting, validate the whole request. With an account on file, the SDK validates the fields
the customer must enter (`MUST_WRITE`) and the fields the customer changed.

<!-- region: validate-payment-request -->
```ts
// Call before encrypting. Returns the error messages per field id; empty when the request is valid.
export function validatePaymentRequest(
  paymentRequest: PaymentRequest
): Record<string, string[]> {
  const result = paymentRequest.validate();
  const errorsByField: Record<string, string[]> = {};

  for (const error of result.errors) {
    (errorsByField[error.paymentProductFieldId] ??= []).push(
      error.errorMessage
    );
  }

  return errorsByField;
}
```

## 7. Surcharge and currency conversion (optional)

Only when your merchant account has surcharging or dynamic currency conversion enabled. Call these
once the card product is known, and show the result before the customer pays.

### Surcharge

The payment context keeps the net amount (without surcharge); the platform adds the surcharge when
your backend creates the payment. Show the surcharge and the total before the customer pays.

<!-- region: surcharge-calculation -->
```ts
// Call once the card is known: either the digits entered so far plus the detected product id,
// or the selected account on file. Only the first 8 digits are sent: never send the complete card
// number, because this request is not encrypted and the first digits identify the brand and issuer.
export async function getSurcharge(
  sdk: OnlinePaymentSdk,
  paymentContext: PaymentContextWithAmount,
  card:
    | { digits: string; paymentProductId: number }
    | { accountOnFile: AccountOnFile }
): Promise<
  { surchargeAmount: AmountOfMoney; totalAmount: AmountOfMoney } | undefined
> {
  const cardOrToken =
    'accountOnFile' in card
      ? card.accountOnFile.id // the token
      : {
          partialCreditCardNumber: card.digits.slice(0, 8),
          paymentProductId: card.paymentProductId,
        };

  const response = await sdk.getSurchargeCalculation(
    paymentContext.amountOfMoney,
    cardOrToken
  );
  const surcharge = response.surcharges[0];

  if (surcharge.result === SurchargeResult.NO_SURCHARGE) {
    return undefined;
  }

  // Show both amounts to the customer before they pay.
  return {
    surchargeAmount: surcharge.surchargeAmount,
    totalAmount: surcharge.totalAmount,
  };
}
```

### Currency conversion

Dynamic currency conversion (eDCC, Visa and Mastercard only) lets the customer pay in their card's
currency. The card schemes' rules apply to how you show the offer:

- Show both amounts as two equal options: same size, colour and font. Include your currency, the
  card's currency, the exchange rate, the mark-up and `proposal.disclaimerDisplay`.
- Preselect neither option. Do not use a yes/no or accept/decline question: the customer must
  actively choose one amount.
- If the customer chooses your currency, continue in your currency and do not offer the conversion
  again in this checkout.

<!-- region: currency-conversion -->
```ts
export interface CurrencyConversionOffer {
  dccSessionId: string;
  proposal: DccProposal;
}

export async function getCurrencyConversionOffer(
  sdk: OnlinePaymentSdk,
  amountToPay: AmountOfMoney, // the order amount, or the surcharge's totalAmount when a surcharge applies
  card:
    | { digits: string; paymentProductId: number }
    | { accountOnFile: AccountOnFile }
): Promise<CurrencyConversionOffer | undefined> {
  const cardOrToken =
    'accountOnFile' in card
      ? card.accountOnFile.id
      : {
          partialCreditCardNumber: card.digits.slice(0, 8),
          paymentProductId: card.paymentProductId,
        };

  const response = await sdk
    .getCurrencyConversionQuote(amountToPay, cardOrToken)
    .catch((error: unknown) => {
      if (error instanceof ResponseError && error.httpStatusCode === 404) {
        return undefined; // the card cannot be converted: no offer
      }
      throw error;
    });

  if (!response || response.result.result !== ConversionResultType.Allowed) {
    return undefined; // no offer: pay in your currency, send no currency conversion data
  }

  // Show two options with the same size, colour and font: proposal.baseAmount (your currency) and
  // proposal.targetAmount (the card's currency), with proposal.rate (exchange rate and mark-up) and
  // proposal.disclaimerDisplay. Preselect neither option and do not ask a yes/no question: the
  // customer must actively choose one.
  return { dccSessionId: response.dccSessionId, proposal: response.proposal };
}
```

When the customer has chosen, send the choice with the payment. Your backend passes it to Create
Payment as `cardPaymentMethodSpecificInput.currencyConversion`. Both `dccSessionId` and
`acceptedByUser` are required, also when the customer chose your currency (`acceptedByUser: false`).

<!-- region: currency-conversion-choice -->
```ts
// Call when the customer actively selects one of the two options. Pass the result to
// submitEncryptedPayment, also when the customer chose your currency. Once the customer chose your
// currency, do not offer the conversion again in this checkout.
export function chooseCurrency(
  offer: CurrencyConversionOffer,
  payInCardCurrency: boolean
): CurrencyConversionChoice {
  return {
    dccSessionId: offer.dccSessionId,
    acceptedByUser: payInCardCurrency,
  };
}
```

When both surcharging and currency conversion apply, calculate the surcharge first and request the
currency conversion quote for the surcharge's `totalAmount` (net amount plus surcharge), as the Client
API reference prescribes. Without a surcharge, request it for the order amount. The payment context
keeps the net amount in both cases.

## 8. Encrypt and send to your backend

`encryptPaymentRequest` validates the request again and throws an `InvalidArgumentError` if it is
not valid. The result has two parts: `encryptedCustomerInput` and `encodedClientMetaInfo`. Send both
to your backend; it passes them to Create Payment.

<!-- region: encrypt-payment-request -->
```ts
export async function payWithEncryptedRequest(
  sdk: OnlinePaymentSdk,
  paymentRequest: PaymentRequest,
  currencyConversion?: CurrencyConversionChoice // the customer's choice, when a conversion offer was shown
): Promise<
  | { validationErrors: Record<string, string[]> }
  | { result: MerchantPaymentResponse }
> {
  const validationErrors = validatePaymentRequest(paymentRequest);
  if (Object.keys(validationErrors).length > 0) {
    return { validationErrors }; // show these to the customer; do not encrypt
  }

  // The only way card data leaves the device: encrypted by the SDK.
  // Never send, log or store the raw field values.
  const encryptedRequest = await sdk.encryptPaymentRequest(paymentRequest);

  // Your backend passes encryptedCustomerInput to Create Payment and decides the outcome.
  const result = await submitEncryptedPayment(
    encryptedRequest,
    currencyConversion
  );

  return { result };
}
```

## 9. Handle the result

Your backend returns what Create Payment returned. When the payment needs a redirect (for example
3-D Secure), the backend returns the redirect URL from that response.

<!-- region: handle-payment-result -->
```ts
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
```

After the redirect, the customer returns to the app through the deep link your backend set as the
payment's return URL. The app must be configured for that deep link (URL scheme on iOS, intent
filter on Android). Listen for it and ask your backend for the status:

<!-- region: handle-return-deep-link -->
```ts
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
```

If the app was closed while the customer was on the 3-D Secure page, the deep link starts the app
and no `url` event fires. Check the start URL once when the checkout screen opens:

<!-- region: handle-return-cold-start -->
```ts
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
```

## Tokenization without a payment

To store a card without paying, use `CreditCardTokenRequest`. It applies no validation of its own,
so validate the values with the card product's fields first. Load the card product with
`getIinDetails` and `getPaymentProduct` as in a payment. There is no order amount, so create the
`PaymentContext` with an amount of 1, the smallest unit of the currency (for example 1 cent for
EUR). Do not use 0: the Client API answers an amount of 0 with an error.

<!-- region: encrypt-token-request -->
```ts
const CARD_FIELD_IDS = [
  'cardNumber',
  'cardholderName',
  'expiryDate',
  'cvv',
] as const;
type CardForm = Record<(typeof CARD_FIELD_IDS)[number], string>;

export async function storeCard(
  sdk: OnlinePaymentSdk,
  cardProduct: PaymentProduct, // from sdk.getPaymentProduct for the detected card product
  form: CardForm // the values as shown in the inputs, with or without masks
): Promise<{ errors: string[] } | { token: string }> {
  // Remove the masks first ("12/26" becomes "1226"): the validation rules and the token request
  // expect values without formatting.
  const values = Object.fromEntries(
    CARD_FIELD_IDS.map((fieldId) => [
      fieldId,
      cardProduct.getField(fieldId)?.removeMask(form[fieldId]) ?? form[fieldId],
    ])
  ) as CardForm;

  // CreditCardTokenRequest applies no validation, so validate with the product's fields first.
  const errors = CARD_FIELD_IDS.flatMap(
    (fieldId) =>
      cardProduct
        .getField(fieldId)
        ?.validate(values[fieldId])
        .map((error) => error.errorMessage) ?? []
  );
  if (errors.length > 0) {
    return { errors };
  }

  const tokenRequest = new CreditCardTokenRequest();
  tokenRequest.setCardNumber(values.cardNumber);
  tokenRequest.setCardholderName(values.cardholderName);
  tokenRequest.setExpiryDate(values.expiryDate);
  tokenRequest.setSecurityCode(values.cvv);
  tokenRequest.setProductPaymentId(cardProduct.id);

  const encryptedRequest = await sdk.encryptTokenRequest(tokenRequest);

  // Your backend creates the token with the encrypted data.
  return submitEncryptedToken(encryptedRequest);
}
```
