import type { PaymentRequest } from 'onlinepayments-sdk-client-reactnative';
import type { FormField } from './payment-product-details';

// [START set-field-value]
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
// [END set-field-value]

// [START validate-field]
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
// [END validate-field]

// [START validate-payment-request]
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
// [END validate-payment-request]
