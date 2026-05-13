# Online Payments - React Native SDK

The Online Payments React Native SDK helps you accept payments in your React Native app through the Online Payments platform.

The SDK's main function is to establish a secure channel between your app and our server. This channel processes security credentials to guarantee safe transit of your customers' data during the payment process.

**The Online Payments SDK helps you with:**
- handling encryption of payment details
- convenient TypeScript wrappers for API responses
- user-friendly formatting of payment data, such as card numbers and expiry dates
- validating user input
- determining the card's associated payment provider

## Table of Contents
- [Online Payments - React Native SDK](#online-payments---react-native-sdk)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Installation](#installation)
    - [Android](#android)
  - [Getting started](#getting-started)
  - [Type definitions](#type-definitions)
    - [OnlinePaymentsSdk](#onlinepaymentssdk)
    - [PaymentContext](#paymentcontext)
    - [BasicPaymentProducts](#basicpaymentproducts)
    - [BasicPaymentProduct](#basicpaymentproduct)
    - [AccountOnFile](#accountonfile)
    - [PaymentProduct](#paymentproduct)
    - [PaymentProductField](#paymentproductfield)
    - [PaymentRequest](#paymentrequest)
      - [Tokenize payment request](#tokenize-payment-request)
      - [Set field values to payment request](#set-field-values-to-payment-request)
      - [Validate payment request](#validate-payment-request)
      - [AccountOnFile with READ_ONLY fields](#accountonfile-with-read_only-fields)
      - [Encrypt payment request](#encrypt-payment-request)
    - [CreditCardTokenRequest](#creditcardtokenrequest)
    - [IINDetails](#iindetails)
    - [Masking](#masking)
  - [Payment Steps](#payment-steps)
    - [1. Initialize the React Native SDK for this payment](#1-initialize-the-react-native-sdk-for-this-payment)
    - [2. Retrieve the payment products](#2-retrieve-the-payment-products)
    - [3. Retrieve payment product details](#3-retrieve-payment-product-details)
    - [4. Encrypt payment information](#4-encrypt-payment-information)
    - [5. Response from the Server API call](#5-response-from-the-server-api-call)
  - [Testing](#testing)
    - [Unit tests](#unit-tests)

## Requirements

This SDK is intended for React Native applications and requires a backend that can create a Client Session using the Server API.

Your app needs the following session values from your backend:

- `clientSessionId`
- `customerId`
- `clientApiUrl`
- `assetUrl`

## Installation

Add the dependency to your app's `package.json` file:

```json
{
  "dependencies": {
    "onlinepayments-sdk-client-reactnative": "~x.y.z"
  }
}
```

Then install dependencies:

```bash
npm install
```

### Android

If your app uses `minSdkVersion` 20 or lower, enable multidex in your Android app:

```gradle
defaultConfig {
    // ...
    multiDexEnabled true
}

dependencies {
    // ...
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

## Getting started

To accept your first payment using the SDK, complete the steps below. Also see [Payment Steps](#payment-steps) for a more detailed flow.

1. Request your server to create a Client Session using one of our Server SDKs.
2. Initialize the SDK using the session details.

```ts
import { init } from 'onlinepayments-sdk-client-reactnative';

const sdk = init(
  {
    clientSessionId: '47e9dc332ca24273818be2a46072e006',
    customerId: '9991-0d93d6a0e18443bd871c89ec6d38a873',
    clientApiUrl: 'https://clientapi.com',
    assetUrl: 'https://assets.com',
  },
  {
    appIdentifier: 'React Native Example Application/v1.0.2',
  }
);
```

3. Configure your payment context using the `PaymentContext` type.

```ts
import type { PaymentContext } from 'onlinepayments-sdk-client-reactnative';

const paymentContext: PaymentContext = {
  amountOfMoney: {
    amount: 1298,
    currencyCode: 'EUR',
  },
  countryCode: 'NL',
  isRecurring: false,
};
```

4. Retrieve available payment products and accounts on file.

```ts
try {
  const basicPaymentProducts = await sdk.getBasicPaymentProducts(paymentContext);
  // Display basicPaymentProducts.paymentProducts and basicPaymentProducts.accountsOnFile
} catch (error) {
  // Handle error while retrieving payment products
}
```

5. Retrieve a detailed `PaymentProduct` for the product selected by your customer.

```ts
try {
  const paymentProduct = await sdk.getPaymentProduct(1, paymentContext);
  // Display paymentProduct.getFields() in your form
} catch (error) {
  // Handle error while retrieving payment product details
}
```

6. Save your customer's input in a `PaymentRequest`.

```ts
import { PaymentRequest } from 'onlinepayments-sdk-client-reactnative';

const paymentRequest = new PaymentRequest(paymentProduct);
paymentRequest.setValue('cardNumber', '4242 4242 4242 4242');
paymentRequest.setValue('cvv', '123');
paymentRequest.setValue('expiryDate', '12/26');
```

7. Validate and encrypt the payment request, then send encrypted data to your server.

```ts
const validationResult = paymentRequest.validate();

if (!validationResult.isValid) {
  // Show validationResult.errors
} else {
  const encryptedRequest = await sdk.encryptPaymentRequest(paymentRequest);
  // Send encryptedRequest.encryptedCustomerInput to your server
}
```

8. Request your server to create the payment (Server API: Create Payment), providing the encrypted data in `encryptedCustomerInput`.

## Type definitions

### OnlinePaymentsSdk

For all interactions with the SDK, an initialized SDK instance is required. In this README, that instance is referred to as `sdk`.

```ts
import { init } from 'onlinepayments-sdk-client-reactnative';

const sdk = init(
  {
    clientSessionId: '47e9dc332ca24273818be2a46072e006',
    customerId: '9991-0d93d6a0e18443bd871c89ec6d38a873',
    clientApiUrl: 'https://clientapi.com',
    assetUrl: 'https://assets.com',
  },
  {
    appIdentifier: 'React Native Example Application/v1.0.2',
  }
);
```

Almost all methods offered by `sdk` are wrappers around the Client API. They make requests and convert responses into typed domain objects with convenience methods.

### PaymentContext

`PaymentContext` contains the context of the upcoming payment.

```ts
export interface PaymentContext {
  amountOfMoney: {
    amount?: number;
    currencyCode: string;
  };
  countryCode: string;
  isRecurring?: boolean;
}
```

### BasicPaymentProducts

Use `sdk.getBasicPaymentProducts(paymentContext)` to retrieve available payment products and accounts on file.

```ts
const basicPaymentProducts = await sdk.getBasicPaymentProducts(paymentContext);

basicPaymentProducts.paymentProducts; // BasicPaymentProduct[]
basicPaymentProducts.accountsOnFile;  // AccountOnFile[]
```

### BasicPaymentProduct

`BasicPaymentProduct` contains lightweight product information used to present a selection list.

```ts
const basicPaymentProduct = basicPaymentProducts.paymentProducts.find((p) => p.id === 1);

basicPaymentProduct?.id;
basicPaymentProduct?.label;
basicPaymentProduct?.logo;
basicPaymentProduct?.accountsOnFile;
```

### AccountOnFile

`AccountOnFile` represents stored payment details for the current customer.

```ts
const accountOnFile = basicPaymentProducts.accountsOnFile[0];

accountOnFile?.getValue('cardNumber');
accountOnFile?.getValue('cardholderName');
accountOnFile?.getValue('expiryDate');
```

If your customer selects an account on file, set it on the `PaymentRequest`.

### PaymentProduct

`PaymentProduct` extends `BasicPaymentProduct` and contains field definitions your app needs to render the payment form.

```ts
const paymentProduct = await sdk.getPaymentProduct(1, paymentContext);

const allFields = paymentProduct.getFields();
const requiredFields = paymentProduct.getRequiredFields();
const cvvField = paymentProduct.getField('cvv');
```

### PaymentProductField

Each `PaymentProductField` has an identifier, type, restrictions, and helper functions for formatting and validation.

```ts
const expiryDateField = paymentProduct.getField('expiryDate');

expiryDateField?.isRequired();
expiryDateField?.shouldObfuscate();
expiryDateField?.applyMask('1226');
expiryDateField?.removeMask('12/26');
expiryDateField?.validate('12/26');
```

### PaymentRequest

Once a `PaymentProduct` is selected, create a `PaymentRequest` to hold your customer's values.

```ts
import { PaymentRequest } from 'onlinepayments-sdk-client-reactnative';

const paymentRequest = new PaymentRequest(
  paymentProduct,
  accountOnFile, // optional
  false // optional tokenize, default false
);
```

#### AccountOnFile with READ_ONLY fields

When no `AccountOnFile` is selected for a specific `PaymentRequest`, all request fields are writable and can be set normally.

Once an `AccountOnFile` is set on `PaymentRequest`, the SDK enforces the following behavior:

- previously set values for fields that are no longer writable are cleared
- fields marked as `READ_ONLY` cannot be set manually (`setValue` throws `InvalidArgumentError`)
- calling `paymentRequest.getField(readOnlyFieldId).getValue()` returns `undefined`

This ensures only fields that are allowed to change are submitted.

#### Tokenize payment request

`PaymentRequest` can be tokenized and stored as an account on file.

```ts
const paymentRequest = new PaymentRequest(paymentProduct);
paymentRequest.setTokenize(true);
```

If your customer selected an account on file, you can set it in constructor or later:

```ts
const paymentRequest = new PaymentRequest(paymentProduct, accountOnFile);
// or
paymentRequest.setAccountOnFile(accountOnFile);
```

#### Set field values to payment request

Set field values by id:

```ts
paymentRequest.setValue('cardNumber', '4242 4242 4242 4242');
paymentRequest.setValue('cvv', '123');
paymentRequest.setValue('expiryDate', '12/26');
```

Or by using a `PaymentRequestField` directly:

```ts
paymentRequest.getField('cardNumber').setValue('4242 4242 4242 4242');
```

#### Validate payment request

After all values are set, validate the request:

```ts
const validationResult = paymentRequest.validate();

if (validationResult.isValid) {
  // payment request is valid
} else {
  // validationResult.errors contains validation messages
}
```

#### Encrypt payment request

Once valid, encrypt the payment request using `sdk.encryptPaymentRequest`:

```ts
const encryptedRequest = await sdk.encryptPaymentRequest(paymentRequest);

encryptedRequest.encryptedCustomerInput;
encryptedRequest.encodedClientMetaInfo;
```

> Although it is possible to use your own encryption algorithms, we advise you to use the encryption functionality offered by the SDK.

### CreditCardTokenRequest

Use `CreditCardTokenRequest` for tokenization flows.

```ts
import { CreditCardTokenRequest } from 'onlinepayments-sdk-client-reactnative';

const tokenRequest = new CreditCardTokenRequest();

tokenRequest.setCardNumber('4567350000427977');
tokenRequest.setCardholderName('Jane Doe');
tokenRequest.setExpiryDate('1230');
tokenRequest.setSecurityCode('123');
tokenRequest.setProductPaymentId(1);

const encryptedRequest = await sdk.encryptTokenRequest(tokenRequest);
```

### IINDetails

The first six digits of a payment card are the Issuer Identification Number (IIN). Use `sdk.getIinDetails` to retrieve card/product information.

```ts
import {
  IinDetailStatus,
  type PaymentContextWithAmount,
} from 'onlinepayments-sdk-client-reactnative';

const paymentContextWithAmount: PaymentContextWithAmount = {
  amountOfMoney: { amount: 1298, currencyCode: 'EUR' },
  countryCode: 'NL',
  isRecurring: false,
};

const iinDetails = await sdk.getIinDetails('456735', paymentContextWithAmount);

if (iinDetails.status === IinDetailStatus.SUPPORTED) {
  // iinDetails.paymentProductId can be used to update your UI
}
```

Possible `IinDetailStatus` values are:
- `SUPPORTED`
- `EXISTING_BUT_NOT_ALLOWED`
- `UNSUPPORTED`
- `NOT_ENOUGH_DIGITS`
- `UNKNOWN`

Some cards are co-branded and can be processed with different brands. Use `coBrands` from the response when present.

### Masking

The SDK provides masking helpers on `PaymentProductField` and `PaymentRequestField`.

```ts
const cardNumberField = paymentProduct.getField('cardNumber');

cardNumberField?.applyMask('1234123412341234');
cardNumberField?.removeMask('1234 1234 1234 1234');

const maskedValue = paymentRequest.getField('cardNumber').getMaskedValue();
```

## Payment Steps

Setting up and completing a payment using the React Native SDK involves the following steps:

### 1. Initialize the React Native SDK for this payment

Use client session and customer identifiers, API URLs, and your app identifier.

```ts
import { init, type PaymentContext } from 'onlinepayments-sdk-client-reactnative';

const sdk = init(
  {
    clientSessionId: '47e9dc332ca24273818be2a46072e006',
    customerId: '9991-0d93d6a0e18443bd871c89ec6d38a873',
    clientApiUrl: 'https://clientapi.com',
    assetUrl: 'https://assets.com',
  },
  {
    appIdentifier: 'React Native Example Application/v1.0.2',
  }
);

const paymentContext: PaymentContext = {
  amountOfMoney: {
    amount: 1298,
    currencyCode: 'EUR',
  },
  countryCode: 'NL',
  isRecurring: false,
};
```

> A successful Create Session response can be used directly as input for `init`.

### 2. Retrieve the payment products

Retrieve payment products and accounts on file:

```ts
const basicPaymentProducts = await sdk.getBasicPaymentProducts(paymentContext);
```

Your app can use this data to build the payment-product selection screen.

### 3. Retrieve payment product details

Retrieve full product details, including fields and validation restrictions:

```ts
const paymentProduct = await sdk.getPaymentProduct(1, paymentContext);
const fields = paymentProduct.getFields();
```

If an account on file is selected, values already known for that account can be prefilled where applicable.

### 4. Encrypt payment information

Encrypt customer input from `PaymentRequest` and forward the encrypted payload to your server:

```ts
import { PaymentRequest } from 'onlinepayments-sdk-client-reactnative';

const paymentRequest = new PaymentRequest(paymentProduct);
paymentRequest.setValue('cardNumber', '4242 4242 4242 4242');
paymentRequest.setValue('cvv', '123');
paymentRequest.setValue('expiryDate', '12/26');

const validationResult = paymentRequest.validate();
if (!validationResult.isValid) {
  // show validationResult.errors
} else {
  const encryptedRequest = await sdk.encryptPaymentRequest(paymentRequest);
  // send encryptedRequest.encryptedCustomerInput to your server
}
```

The SDK handles public key retrieval, encryption, and encoding.

### 5. Response from the Server API call

Your app should continue the payment flow based on the Server API response. Depending on the payment method, the customer might need to complete additional authorization steps (for example, a redirect).

## Testing

This library contains unit and integration tests written with [Vitest](https://vitest.dev).

### Unit tests

Run unit tests with:

```bash
yarn test:unit
```
