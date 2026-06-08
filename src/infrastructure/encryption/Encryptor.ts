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

import { JOSEEncryptor } from './JOSEEncryptor';
import {
  CreditCardTokenRequest,
  EncryptionError,
  PaymentRequest,
  type PublicKeyResponse,
} from '../../domain';
import type {
  EncryptedCustomerInput,
  EncryptedPaymentValue,
  EncryptorProps,
} from './types';
import { random as forgeRandom, util as forgeUtil } from 'node-forge';

export class Encryptor {
  private readonly clientSessionId: string;

  /**
   * Constructs an instance of the class with the given parameters.
   *
   * @param {EncryptorProps} props - Properties required to build the encryptor.
   */
  constructor(props: EncryptorProps) {
    this.clientSessionId = props.clientSessionId;
  }

  /**
   * Encrypts the provided PaymentRequest object using a public key and returns the encrypted string.
   *
   * @param {PublicKeyResponse} publicKey - The public key used for encryption.
   * @param {PaymentRequest} paymentRequest - The payment request to be encrypted.
   * @return {string} The encrypted representation of the payment request.
   */
  encrypt(
    publicKey: PublicKeyResponse,
    paymentRequest: PaymentRequest
  ): string {
    return JOSEEncryptor.encrypt(
      this.createEncryptedConsumerInput(paymentRequest),
      publicKey
    );
  }

  /**
   * Encrypts the provided CreditCardTokenRequest object using a public key and returns the encrypted string.
   *
   * @param {PublicKeyResponse} publicKey - The public key used for encryption.
   * @param {CreditCardTokenRequest} tokenRequest - The token request to be encrypted.
   * @return {string} The encrypted representation of the token request.
   * @throws {EncryptionError} Will throw an error if the token request has no paymentProductId.
   */
  encryptTokenRequest(
    publicKey: PublicKeyResponse,
    tokenRequest: CreditCardTokenRequest
  ): string {
    return JOSEEncryptor.encrypt(
      this.createEncryptedConsumerInputFromTokenRequest(tokenRequest),
      publicKey
    );
  }

  private mapValues(
    values: Record<string, string | number | undefined>
  ): EncryptedPaymentValue[] {
    return Object.entries(values)
      .filter(
        (entry): entry is [string, string | number] => entry[1] !== undefined
      )
      .map(([key, value]) => ({
        key,
        value: String(value),
      }));
  }

  /**
   * Generates an encrypted customer input payload based on the provided token request.
   *
   * @param {CreditCardTokenRequest} tokenRequest - The credit card token request object containing values and payment details.
   * @return {EncryptedCustomerInput} The payload to be encrypted.
   * @throws {EncryptionError} Will throw an error if the token request has no paymentProductId.
   */
  private createEncryptedConsumerInputFromTokenRequest(
    tokenRequest: CreditCardTokenRequest
  ): EncryptedCustomerInput {
    const paymentProductId = tokenRequest.getPaymentProductId();

    if (paymentProductId === undefined || paymentProductId === null) {
      throw new EncryptionError(
        'Error encrypting credit card token request: the payment product ID is not set.',
        {
          data: 'paymentProductId',
        }
      );
    }

    return {
      clientSessionId: this.clientSessionId,
      nonce: forgeUtil.bytesToHex(forgeRandom.getBytesSync(16)),
      paymentProductId,
      paymentValues: this.mapValues(tokenRequest.getValues()),
    };
  }

  /**
   * Generates an encrypted customer input payload based on the provided payment request.
   *
   * @param {PaymentRequest} paymentRequest - The payment request object containing values and payment details.
   * @return {EncryptedCustomerInput} The payload to be encrypted.
   */
  private createEncryptedConsumerInput(
    paymentRequest: PaymentRequest
  ): EncryptedCustomerInput {
    const paymentProductId = paymentRequest.getPaymentProductId();

    if (paymentProductId === undefined || paymentProductId === null) {
      throw new EncryptionError(
        'Error encrypting payment request: the payment product ID is not set.',
        {
          data: 'paymentProductId',
        }
      );
    }

    const blob: EncryptedCustomerInput = {
      clientSessionId: this.clientSessionId,
      nonce: forgeUtil.bytesToHex(forgeRandom.getBytesSync(16)),
      paymentProductId,
      tokenize: paymentRequest.getTokenize(),
      paymentValues: this.mapValues(paymentRequest.getValues()),
    };

    const accountOnFile = paymentRequest.getAccountOnFile();
    if (accountOnFile?.id) {
      blob.accountOnFileId = accountOnFile.id;
    }

    return blob;
  }
}
