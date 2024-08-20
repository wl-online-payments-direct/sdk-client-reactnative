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

@interface RCT_EXTERN_MODULE(OnlinePaymentsMasking, NSObject)

RCT_EXTERN_METHOD(
  applyMaskForPaymentProductField:(NSString)paymentProductFieldMaskRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  removeMaskForPaymentProductField:(NSString)paymentProductFieldMaskRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  maskedValueForPaymentRequest:(NSString)paymentRequestMaskedValueRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  unmaskedValueForPaymentRequest:(NSString)paymentRequestUnmaskedValueRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  allMaskedValuesForPaymentRequest:(NSString)paymentRequestAllMaskedValuesRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  allUnmaskedValuesForPaymentRequest:(NSString)paymentRequestAllUnmaskedValuesRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  maskedValueForAccountOnFile:(NSString)accountOnFileMaskedValueRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  customMaskedValueForAccountOnFile:(NSString)accountOnFileCustomMaskedValueRequest
  withResolver:(RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject
)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
