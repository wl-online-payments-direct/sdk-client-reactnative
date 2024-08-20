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
 
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(OnlinePaymentsValidation, NSObject)

RCT_EXTERN_METHOD(
  validatePaymentRequest:(NSString)paymentRequestValidationRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  validatePaymentProductFieldForPaymentRequest:(NSString)paymentRequestFieldValidationRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  validateValueForPaymentProductField:(NSString)paymentProductFieldValidationRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  validateValueForValidationRule:(NSString)ruleValidationRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  validateValidationRuleForFieldOfPaymentRequest:(NSString)paymentRequestFieldRuleValidationRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
