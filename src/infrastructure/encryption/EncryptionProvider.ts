import {
  CreditCardTokenRequest,
  PaymentRequest,
  type PublicKeyResponse,
} from '../../domain';

export interface EncryptionProvider {
  encrypt(publicKey: PublicKeyResponse, request: PaymentRequest): string;

  encryptTokenRequest(
    publicKey: PublicKeyResponse,
    request: CreditCardTokenRequest
  ): string;
}
