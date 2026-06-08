/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

export interface Metadata {
  readonly screenSize: string;
  readonly platformIdentifier: string;
  readonly sdkIdentifier: string;
  readonly sdkCreator: string;
  readonly appIdentifier: string;
  readonly deviceBrand: string;
  readonly deviceType: string;
}

export interface EncryptedPaymentValue {
  key: string;
  value: string;
}

export interface EncryptedCustomerInput {
  clientSessionId: string;
  nonce: string;
  paymentProductId: number;
  accountOnFileId?: string;
  tokenize?: boolean;
  paymentValues: EncryptedPaymentValue[];
}

export interface EncryptorProps {
  clientSessionId: string;
}
