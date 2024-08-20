/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2024 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import {
  BasicPaymentProducts,
  type BasicPaymentProductsJSON,
} from '../api/models/payment-product/BasicPaymentProducts';
import {
  PaymentProduct,
  type PaymentProductJSON,
} from '../api/models/payment-product/PaymentProduct';
import {
  AccountOnFileAttributeStatus,
  CardType,
  ConversionResultType,
  FormElementType,
  IinDetailsStatus,
  PaymentProductFieldType,
  PreferredInputType,
  SurchargeResult,
  ValidationRuleLength,
  ValidationType,
  type ApiErrorItem,
  type CurrencyConversion,
  type IinDetailsResponse,
  type PaymentProductNetworks,
  type PreparedPaymentRequest,
  type PublicKey,
  type SurchargeCalculation,
} from '../models';

function ObjectFromFile<T>(fileName: string): T {
  return require(fileName).data;
}

function ApiErrorItemFromFile(fileName: string): ApiErrorItem {
  return require(fileName).error.apiError.errors[0];
}

describe('Deserialization test', () => {
  it('deserializePublicKey', () => {
    const publicKey = ObjectFromFile<PublicKey>(
      './__mock_responses__/public_key_response.json'
    );

    expect(publicKey.keyId).toBe('TestKeyId');
    expect(publicKey.publicKey).toBe('t3stP0bl1cK3y');
  });

  it('deserializeIinDetails', () => {
    const iinDetailsResponse = ObjectFromFile<IinDetailsResponse>(
      './__mock_responses__/iin_details_response.json'
    );

    expect(iinDetailsResponse.status).toBe(IinDetailsStatus.Supported);
    expect(iinDetailsResponse.coBrands?.length).toBe(2);
    expect(iinDetailsResponse.coBrands?.at(0)?.isAllowedInContext).toBe(true);
    expect(iinDetailsResponse.coBrands?.at(0)?.cardType).toBe(CardType.Debit);
    expect(iinDetailsResponse.coBrands?.at(0)?.paymentProductId).toBe('3');
    expect(iinDetailsResponse.coBrands?.at(1)?.isAllowedInContext).toBe(false);
    expect(iinDetailsResponse.coBrands?.at(1)?.cardType).toBe(CardType.Prepaid);
    expect(iinDetailsResponse.coBrands?.at(1)?.paymentProductId).toBe('119');
    expect(iinDetailsResponse.countryCode).toBe('US');
    expect(iinDetailsResponse.isAllowedInContext).toBe(true);
    expect(iinDetailsResponse.paymentProductId).toBe('3');
    expect(iinDetailsResponse.cardType).toBe(CardType.Credit);
  });

  it('deserializeBasicPaymentProducts', () => {
    const basicPaymentProductsJSON = ObjectFromFile<BasicPaymentProductsJSON>(
      './__mock_responses__/basic_payment_products_response.json'
    );
    const basicPaymentProducts = new BasicPaymentProducts(
      basicPaymentProductsJSON
    );

    expect(basicPaymentProducts.basicPaymentProducts.length).toBe(3);
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)?.accountsOnFile.length
    ).toBe(0);
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)?.allowsRecurring
    ).toBe(true);
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)?.allowsTokenization
    ).toBe(true);
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)?.displayHintsList.length
    ).toBe(1);
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)?.displayHintsList.at(0)
        ?.displayOrder
    ).toBe(0);
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)?.displayHintsList.at(0)
        ?.label
    ).toBe('American Express');
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)?.displayHintsList.at(0)
        ?.logo
    ).toBe('American_Express_logo');
    expect(basicPaymentProducts.basicPaymentProducts.at(0)?.id).toBe('2');
    expect(basicPaymentProducts.basicPaymentProducts.at(0)?.paymentMethod).toBe(
      'card'
    );
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)?.paymentProductGroup
    ).toBe('Cards');
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)?.usesRedirectionTo3rdParty
    ).toBe(false);
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)
        ?.paymentProduct320SpecificData
    ).toBeUndefined();
    expect(
      basicPaymentProducts.basicPaymentProducts.at(0)
        ?.paymentProduct302SpecificData
    ).toBeUndefined();
  });

  it('deserializePaymentProductWithAccountOnFile', () => {
    const paymentProductJSON = ObjectFromFile<PaymentProductJSON>(
      './__mock_responses__/payment_product_response.json'
    );
    const paymentProduct = new PaymentProduct(paymentProductJSON);

    expect(paymentProduct.accountsOnFile.length).toBe(1);
    expect(paymentProduct.accountsOnFile.at(0)?.attributes.length).toBe(4);
    expect(paymentProduct.accountsOnFile.at(0)?.attributes.at(0)?.key).toBe(
      'cardholderName'
    );
    expect(paymentProduct.accountsOnFile.at(0)?.attributes.at(0)?.value).toBe(
      'Wile E. Coyote'
    );
    expect(paymentProduct.accountsOnFile.at(0)?.attributes.at(0)?.status).toBe(
      AccountOnFileAttributeStatus.ReadOnly
    );
    expect(paymentProduct.accountsOnFile.at(0)?.attributes.at(2)?.key).toBe(
      'cvv'
    );
    expect(paymentProduct.accountsOnFile.at(0)?.attributes.at(2)?.value).toBe(
      '111'
    );
    expect(paymentProduct.accountsOnFile.at(0)?.attributes.at(2)?.status).toBe(
      AccountOnFileAttributeStatus.CanWrite
    );
    expect(paymentProduct.accountsOnFile.at(0)?.id).toBe('0');
    expect(paymentProduct.accountsOnFile.at(0)?.paymentProductId).toBe('3');
    expect(paymentProduct.allowsRecurring).toBe(true);
    expect(paymentProduct.allowsTokenization).toBe(true);
    expect(paymentProduct.displayHintsList.length).toBe(1);
    expect(paymentProduct.displayHintsList.at(0)?.displayOrder).toBe(0);
    expect(paymentProduct.displayHintsList.at(0)?.label).toBe('MasterCard');
    expect(paymentProduct.displayHintsList.at(0)?.logo).toBe('MasterCard_logo');
    expect(paymentProduct.fields.length).toBe(4);
    expect(paymentProduct.fields.at(0)?.dataRestrictions.isRequired).toBe(true);
    expect(
      paymentProduct.fields.at(0)?.dataRestrictions.validationRules.length
    ).toBe(3);
    expect(
      paymentProduct.fields.at(0)?.dataRestrictions.validationRules.at(0)
        ?.validationType
    ).toBe(ValidationType.Length);
    expect(
      (
        paymentProduct.fields
          .at(0)
          ?.dataRestrictions.validationRules.at(0)! as ValidationRuleLength
      ).minLength
    ).toBe(13);
    expect(
      (
        paymentProduct.fields
          .at(0)
          ?.dataRestrictions.validationRules.at(0)! as ValidationRuleLength
      ).maxLength
    ).toBe(19);
    expect(paymentProduct.fields.at(0)?.displayHints?.alwaysShow).toBe(false);
    expect(paymentProduct.fields.at(0)?.displayHints?.displayOrder).toBe(0);
    expect(paymentProduct.fields.at(0)?.displayHints?.formElement?.type).toBe(
      FormElementType.Text
    );
    expect(paymentProduct.fields.at(0)?.displayHints?.label).toBe(
      'Card number'
    );
    expect(paymentProduct.fields.at(0)?.displayHints?.mask).toBe(
      '{{9999}} {{9999}} {{9999}} {{9999}} {{999}}'
    );
    expect(paymentProduct.fields.at(0)?.displayHints?.obfuscate).toBe(false);
    expect(paymentProduct.fields.at(0)?.displayHints?.placeholderLabel).toBe(
      ''
    );
    expect(paymentProduct.fields.at(0)?.displayHints?.preferredInputType).toBe(
      PreferredInputType.StringKeyboard
    );
    expect(paymentProduct.fields.at(0)?.displayHints?.tooltip?.label).toBe('');
    expect(paymentProduct.fields.at(0)?.id).toBe('cardNumber');
    expect(paymentProduct.fields.at(0)?.type).toBe(
      PaymentProductFieldType.NumericString
    );
    expect(paymentProduct.id).toBe('3');
    expect(paymentProduct.paymentMethod).toBe('card');
    expect(paymentProduct.paymentProductGroup).toBe('Cards');
    expect(paymentProduct.usesRedirectionTo3rdParty).toBe(false);
    expect(paymentProduct.paymentProduct320SpecificData).toBeUndefined();
    expect(paymentProduct.paymentProduct302SpecificData).toBeUndefined();
  });

  it('deserializePaymentProductGooglePay', () => {
    const googlePayPaymentProductJSON = ObjectFromFile<PaymentProductJSON>(
      './__mock_responses__/payment_product_response_googlepay.json'
    );
    const googlePayPaymentProduct = new PaymentProduct(
      googlePayPaymentProductJSON
    );

    expect(googlePayPaymentProduct.allowsRecurring).toBe(false);
    expect(googlePayPaymentProduct.allowsTokenization).toBe(false);
    expect(googlePayPaymentProduct.displayHintsList.length).toBe(1);
    expect(googlePayPaymentProduct.displayHintsList.at(0)?.displayOrder).toBe(
      0
    );
    expect(googlePayPaymentProduct.displayHintsList.at(0)?.label).toBe(
      'GOOGLEPAY'
    );
    expect(googlePayPaymentProduct.displayHintsList.at(0)?.logo).toBe(
      'GOOGLEPAY_logo'
    );
    expect(googlePayPaymentProduct.fields.length).toBe(2);
    expect(
      googlePayPaymentProduct.fields.at(0)?.dataRestrictions.isRequired
    ).toBe(true);
    expect(
      googlePayPaymentProduct.fields.at(0)?.dataRestrictions.validationRules
        .length
    ).toBe(0);
    expect(googlePayPaymentProduct.fields.at(0)?.displayHints?.alwaysShow).toBe(
      false
    );
    expect(
      googlePayPaymentProduct.fields.at(0)?.displayHints?.displayOrder
    ).toBe(0);
    expect(
      googlePayPaymentProduct.fields.at(0)?.displayHints?.formElement?.type
    ).toBe(FormElementType.Text);
    expect(googlePayPaymentProduct.fields.at(0)?.displayHints?.label).toBe('');
    expect(
      googlePayPaymentProduct.fields.at(0)?.displayHints?.mask
    ).toBeUndefined();
    expect(googlePayPaymentProduct.fields.at(0)?.displayHints?.obfuscate).toBe(
      false
    );
    expect(
      googlePayPaymentProduct.fields.at(0)?.displayHints?.placeholderLabel
    ).toBe('');
    expect(
      googlePayPaymentProduct.fields.at(0)?.displayHints?.preferredInputType
    ).toBe(PreferredInputType.StringKeyboard);
    expect(
      googlePayPaymentProduct.fields.at(0)?.displayHints?.tooltip?.label
    ).toBe('');
    expect(googlePayPaymentProduct.fields.at(0)?.id).toBe(
      'encryptedPaymentData'
    );
    expect(googlePayPaymentProduct.fields.at(0)?.type).toBe(
      PaymentProductFieldType.String
    );
    expect(googlePayPaymentProduct.id).toBe('320');
    expect(googlePayPaymentProduct.paymentMethod).toBe('mobile');
    expect(googlePayPaymentProduct.paymentProductGroup).toBeUndefined();
    expect(googlePayPaymentProduct.usesRedirectionTo3rdParty).toBe(false);
    expect(
      googlePayPaymentProduct.paymentProduct320SpecificData?.networks.length
    ).toBe(2);
    expect(
      googlePayPaymentProduct.paymentProduct320SpecificData?.networks.at(0)
    ).toBe('VISA');
    expect(
      googlePayPaymentProduct.paymentProduct320SpecificData?.networks[1]
    ).toBe('MASTERCARD');
    expect(googlePayPaymentProduct.paymentProduct320SpecificData?.gateway).toBe(
      'onlinepaymentsgateway'
    );
    expect(
      googlePayPaymentProduct.paymentProduct302SpecificData
    ).toBeUndefined();
  });

  it('deserializePaymentProductNetworks', () => {
    const paymentProductNetworks = ObjectFromFile<PaymentProductNetworks>(
      './__mock_responses__/payment_product_networks_response.json'
    );

    expect(paymentProductNetworks.networks.length).toBe(6);
    expect(paymentProductNetworks.networks.at(0)).toBe('American Express');
    expect(paymentProductNetworks.networks[5]).toBe('VISA');
  });

  it('deserializeCurrencyConversionQuote', () => {
    const currencyConversion = ObjectFromFile<CurrencyConversion>(
      './__mock_responses__/currency_conversion_quote_response.json'
    );

    expect(currencyConversion.dccSessionId).toBe('1a2b3c4d5e6f7g8h9i0j');
    expect(currencyConversion.result.resultReason).toBeUndefined();
    expect(currencyConversion.result.result).toBe(ConversionResultType.Allowed);
    expect(currencyConversion.proposal.baseAmount.amount).toBe(1000);
    expect(currencyConversion.proposal.baseAmount.currencyCode).toBe('AUD');
    expect(currencyConversion.proposal.targetAmount.amount).toBe(691);
    expect(currencyConversion.proposal.targetAmount.currencyCode).toBe('USD');
    expect(currencyConversion.proposal.rate.exchangeRate).toBe(0.69147854);
    expect(currencyConversion.proposal.rate.invertedExchangeRate).toBe(
      1.446176478
    );
    expect(currencyConversion.proposal.rate.markUpRate).toBe(2);
    expect(currencyConversion.proposal.rate.quotationDateTime).toBe(
      '2024-07-15T07:30:00Z'
    );
    expect(currencyConversion.proposal.rate.source).toBe('Online Payments');
    expect(currencyConversion.proposal.disclaimerReceipt).toBe(
      'I have been offered a choice of currencies and I accept the final amount in transaction currency.\n\nCurrency conversion provided by Online Payments'
    );
    expect(currencyConversion.proposal.disclaimerDisplay).toBe(
      'I have been offered a choice of currencies and I accept the final amount in transaction currency.\n\nCurrency conversion provided by Online Payments'
    );
  });

  it('deserializeSurchargeCalculationWithSurcharge', () => {
    const surchargeCalculation = ObjectFromFile<SurchargeCalculation>(
      './__mock_responses__/surcharge_calculation_response_with_surcharge.json'
    );

    expect(surchargeCalculation.surcharges.length).toBe(1);
    expect(surchargeCalculation.surcharges.at(0)?.paymentProductId).toBe(1);
    expect(surchargeCalculation.surcharges.at(0)?.result).toBe(
      SurchargeResult.Ok
    );
    expect(surchargeCalculation.surcharges.at(0)?.netAmount.amount).toBe(1000);
    expect(surchargeCalculation.surcharges.at(0)?.netAmount.currencyCode).toBe(
      'USD'
    );
    expect(surchargeCalculation.surcharges.at(0)?.surchargeAmount.amount).toBe(
      366
    );
    expect(
      surchargeCalculation.surcharges.at(0)?.surchargeAmount.currencyCode
    ).toBe('USD');
    expect(surchargeCalculation.surcharges.at(0)?.totalAmount.amount).toBe(
      1366
    );
    expect(
      surchargeCalculation.surcharges.at(0)?.totalAmount.currencyCode
    ).toBe('USD');
    expect(
      surchargeCalculation.surcharges.at(0)?.surchargeRate
        ?.surchargeProductTypeId
    ).toBe('PAYMENT_PRODUCT_TYPE_ID');
    expect(
      surchargeCalculation.surcharges.at(0)?.surchargeRate
        ?.surchargeProductTypeVersion
    ).toBe('1a2b3c-4d5e-6f7g8h-9i0j');
    expect(
      surchargeCalculation.surcharges.at(0)?.surchargeRate?.adValoremRate
    ).toBe(3.3);
    expect(
      surchargeCalculation.surcharges.at(0)?.surchargeRate?.specificRate
    ).toBe(333);
  });

  it('deserializeSurchargeCalculationWithoutSurcharge', () => {
    const surchargeCalculation = ObjectFromFile<SurchargeCalculation>(
      './__mock_responses__/surcharge_calculation_response_without_surcharge.json'
    );

    expect(surchargeCalculation.surcharges.length).toBe(1);
    expect(surchargeCalculation.surcharges.at(0)?.paymentProductId).toBe(2);
    expect(surchargeCalculation.surcharges.at(0)?.result).toBe(
      SurchargeResult.NoSurcharge
    );
    expect(surchargeCalculation.surcharges.at(0)?.netAmount.amount).toBe(1000);
    expect(surchargeCalculation.surcharges.at(0)?.netAmount.currencyCode).toBe(
      'USD'
    );
    expect(surchargeCalculation.surcharges.at(0)?.surchargeAmount.amount).toBe(
      0
    );
    expect(
      surchargeCalculation.surcharges.at(0)?.surchargeAmount.currencyCode
    ).toBe('USD');
    expect(surchargeCalculation.surcharges.at(0)?.totalAmount.amount).toBe(
      1000
    );
    expect(
      surchargeCalculation.surcharges.at(0)?.totalAmount.currencyCode
    ).toBe('USD');
    expect(
      surchargeCalculation.surcharges.at(0)?.surchargeRate
    ).toBeUndefined();
  });

  it('deserializePreparedPaymentRequest', () => {
    const preparedPaymentRequest = ObjectFromFile<PreparedPaymentRequest>(
      './__mock_responses__/prepared_payment_request.json'
    );

    expect(preparedPaymentRequest.encryptedFields).toBe(
      'A1B2C3encryptedFieldsD4E5F6'
    );
    expect(preparedPaymentRequest.encodedClientMetaInfo).toBe(
      'A1B2C3encodedClientMetaInfoD4E5F6'
    );
  });

  it('deserializeCompleteApiErrorItem', () => {
    const apiErrorItem = ApiErrorItemFromFile(
      './__mock_responses__/api_error_item_complete.json'
    );

    expect(apiErrorItem.errorCode).toBe('123456');
    expect(apiErrorItem.category).toBe('PAYMENT_PLATFORM_ERROR');
    expect(apiErrorItem.httpStatusCode).toBe(404);
    expect(apiErrorItem.id).toBe('1');
    expect(apiErrorItem.message).toBe('The product could not be found');
    expect(apiErrorItem.propertyName).toBe('productId');
    expect(apiErrorItem.retriable).toBe(false);
  });

  it('deserializeMissingOptionalPropertiesApiErrorItem', () => {
    const apiErrorItem = ApiErrorItemFromFile(
      './__mock_responses__/api_error_item_missing_optional_properties.json'
    );

    expect(apiErrorItem.errorCode).toBe('123456');
    expect(apiErrorItem.category).toBeUndefined();
    expect(apiErrorItem.httpStatusCode).toBeUndefined();
    expect(apiErrorItem.id).toBeUndefined();
    expect(apiErrorItem.message).toBe('The product could not be found');
    expect(apiErrorItem.propertyName).toBeUndefined();
    expect(apiErrorItem.retriable).toBeUndefined();
  });
});
