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
