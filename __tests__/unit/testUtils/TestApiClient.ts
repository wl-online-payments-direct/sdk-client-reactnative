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

import { type ApiClient } from '../../../src/infrastructure/interfaces/ApiClient';
import type { ApiVersion } from '../../../src/infrastructure/models/ApiVersion';
import type { PaymentContext, SdkResponse } from '../../../src';
import type {
  ApiContextPostRequestOptions,
  ApiContextRequestOptions,
} from '../../../src/infrastructure/types/ApiRequestTypes';

export class TestApiClient implements ApiClient {
  /**
   * Wrapper around fetch method GET
   */

  async get<Data>(
    _path: string,
    _options?: RequestInit,
    _apiVersion?: ApiVersion
  ): Promise<SdkResponse<Data>> {
    return Promise.reject(new Error('TestApiClient.post method not mocked!'));
  }

  /**
   * Wrapper around fetch method POST
   */

  async post<Data>(
    _path: string,
    _options?: RequestInit,
    _apiVersion?: ApiVersion
  ): Promise<SdkResponse<Data>> {
    return Promise.reject(new Error('TestApiClient.post method not mocked!'));
  }

  /**
   * GET with payment context (includes context-specific query params)
   */
  async getWithContext<Data>(
    _path: string,
    _context: PaymentContext,
    _options?: ApiContextRequestOptions,
    _apiVersion?: ApiVersion
  ): Promise<SdkResponse<Data>> {
    return Promise.reject(
      new Error('TestApiClient.getWithContext method not mocked!')
    );
  }

  /**
   * POST with payment context (includes context-specific query params)
   */
  async postWithContext<Data>(
    _path: string,
    _context: PaymentContext,
    _options?: ApiContextPostRequestOptions,
    _apiVersion?: ApiVersion
  ): Promise<SdkResponse<Data>> {
    return Promise.reject(
      new Error('TestApiClient.postWithContext method not mocked!')
    );
  }
}
