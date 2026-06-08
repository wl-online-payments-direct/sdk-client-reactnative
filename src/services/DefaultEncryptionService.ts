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

import type { ApiClient } from '../infrastructure/interfaces/ApiClient';
import { Util } from '../infrastructure/utils/Util';
import type { CacheManager } from '../infrastructure/utils/CacheManager';
import type { EncryptionService } from './interfaces/EncryptionService';
import { BaseService } from './BaseService';
import {
  CreditCardTokenRequest,
  type EncryptedRequest,
  InvalidArgumentError,
  PaymentRequest,
  PublicKeyResponse,
} from '../domain';
import type { EncryptionProvider } from '../infrastructure/encryption/EncryptionProvider';
import type { DeviceInformationProvider } from '../infrastructure/interfaces/DeviceInformationProvider';

export class DefaultEncryptionService
  extends BaseService
  implements EncryptionService
{
  constructor(
    private readonly encryptionProvider: EncryptionProvider,
    private readonly deviceInformationProvider: DeviceInformationProvider,
    cacheManager: CacheManager,
    apiClient: ApiClient
  ) {
    super(cacheManager, apiClient);
  }

  async getPublicKey(): Promise<PublicKeyResponse> {
    const cacheKey = 'publicKey';

    if (this.cacheManager.has(cacheKey)) {
      return this.cacheManager.get<PublicKeyResponse>(cacheKey)!;
    }

    const response =
      await this.apiClient.get<PublicKeyResponse>('/crypto/publickey');

    this.validateResponse(
      response,
      'Error while trying to fetch the public key.'
    );

    this.cacheManager.set<PublicKeyResponse>(cacheKey, response.data);

    return response.data;
  }

  async encryptPaymentRequest(
    request: PaymentRequest
  ): Promise<EncryptedRequest> {
    const validationResult = request.validate();

    if (!validationResult.isValid) {
      throw new InvalidArgumentError('The payment request is not valid.', {
        data: validationResult,
      });
    }

    return this.encrypt(request);
  }

  async encryptTokenRequest(
    tokenRequest: CreditCardTokenRequest
  ): Promise<EncryptedRequest> {
    return this.encrypt(tokenRequest);
  }

  private async encrypt(
    request: PaymentRequest | CreditCardTokenRequest
  ): Promise<EncryptedRequest> {
    const publicKey = await this.getPublicKey();

    const encryptedFields =
      request instanceof PaymentRequest
        ? this.encryptionProvider.encrypt(publicKey, request)
        : this.encryptionProvider.encryptTokenRequest(publicKey, request);

    const metadata = this.deviceInformationProvider.getMetadata();

    return {
      encryptedCustomerInput: encryptedFields,
      encodedClientMetaInfo: Util.base64UrlEncode(JSON.stringify(metadata)),
    };
  }
}
