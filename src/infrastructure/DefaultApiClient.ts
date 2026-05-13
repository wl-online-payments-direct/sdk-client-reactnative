/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { ApiClient } from './interfaces/ApiClient';
import { Util } from './utils/Util';
import { UrlUtil } from './utils/UrlUtil';
import { ApiVersion } from './models/ApiVersion';
import {
  CommunicationError,
  type PaymentContext,
  type SdkResponse,
} from '../domain';
import type {
  ApiContextPostRequestOptions,
  ApiContextRequestOptions,
  ApiHeaders,
  ApiPostRequestOptions,
  ApiQueryParams,
  ApiRequestOptions,
} from './types/ApiRequestTypes';
import type { DeviceInformationProvider } from './interfaces/DeviceInformationProvider';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export class DefaultApiClient implements ApiClient {
  constructor(
    private readonly clientApiUrl: string,
    private readonly customerId: string,
    private readonly clientSessionId: string,
    private readonly deviceInformationProvider: DeviceInformationProvider,
    private readonly apiVersion = ApiVersion.V1
  ) {}

  /**
   * Wrapper around fetch method GET
   */
  async get<Data>(
    path: string,
    options?: ApiRequestOptions,
    apiVersion?: ApiVersion
  ): Promise<SdkResponse<Data>> {
    const url = this.getBasePath(path, apiVersion ?? this.apiVersion);
    const headers = {
      ...this.getRequestHeaders(),
      ...(options?.headers ?? {}),
    };

    return this.fetchCall<Data>(url, { method: 'GET', headers });
  }

  /**
   * Wrapper around fetch method POST
   */
  async post<Data>(
    path: string,
    options?: ApiPostRequestOptions,
    apiVersion?: ApiVersion
  ): Promise<SdkResponse<Data>> {
    const url = this.getBasePath(path, apiVersion ?? this.apiVersion);
    const headers = {
      ...this.getRequestHeaders(),
      ...(options?.headers ?? {}),
    };

    return this.fetchCall<Data>(url, {
      method: 'POST',
      body: options?.body,
      headers,
    });
  }

  /**
   * GET with payment context (includes context-specific query params)
   */
  async getWithContext<Data>(
    path: string,
    context: PaymentContext,
    options?: ApiContextRequestOptions,
    apiVersion?: ApiVersion
  ): Promise<SdkResponse<Data>> {
    const url = this.getUrlFromContext({
      path,
      apiVersion,
      context,
      queryParams: options?.queryParams,
      useCacheBuster: options?.useCacheBuster,
    });

    const headers = {
      ...this.getRequestHeaders(),
      ...(options?.headers ?? {}),
    };

    return this.fetchCall<Data>(url, { method: 'GET', headers });
  }

  /**
   * POST with payment context (includes context-specific query params)
   */
  async postWithContext<Data>(
    path: string,
    context: PaymentContext,
    options?: ApiContextPostRequestOptions,
    apiVersion?: ApiVersion
  ): Promise<SdkResponse<Data>> {
    const url = this.getUrlFromContext({
      path,
      apiVersion,
      context,
      queryParams: options?.queryParams,
      useCacheBuster: options?.useCacheBuster,
    });

    const headers = {
      ...this.getRequestHeaders(),
      ...(options?.headers ?? {}),
    };

    return this.fetchCall<Data>(url, {
      method: 'POST',
      body: options?.body,
      headers,
    });
  }

  getBasePath(path: string, apiVersion: ApiVersion): string {
    return UrlUtil.segmentsToPath([
      this.clientApiUrl,
      apiVersion,
      this.customerId,
      path,
    ]);
  }

  getRequestHeaders(): ApiHeaders {
    const metadata = this.deviceInformationProvider.getMetadata();

    return {
      'X-GCS-ClientMetaInfo': Util.base64UrlEncode(JSON.stringify(metadata)),
      'Authorization': `GCS v1Client:${this.clientSessionId}`,
    };
  }

  getUrlFromContext({
    path,
    apiVersion,
    context,
    queryParams = {},
    useCacheBuster = false,
  }: {
    path: string;
    apiVersion?: ApiVersion;
    context: PaymentContext;
    queryParams?: ApiQueryParams;
    useCacheBuster?: boolean;
  }): string {
    return UrlUtil.urlWithQueryString(
      this.getBasePath(path, apiVersion ?? this.apiVersion),
      {
        countryCode: context.countryCode,
        isRecurring: context.isRecurring?.toString(),
        amount: context.amountOfMoney.amount?.toString() ?? undefined,
        currencyCode: context.amountOfMoney.currencyCode,
        cacheBust: useCacheBuster ? Date.now().toString() : undefined,
        ...queryParams,
      }
    );
  }

  private async fetchCall<Data>(
    url: string,
    options: {
      method: 'GET' | 'POST';
      headers?: ApiHeaders;
      body?: string;
    }
  ): Promise<SdkResponse<Data>> {
    let response: Response;

    try {
      response = await fetch(url, {
        method: options.method,
        headers: options.headers
          ? { ...defaultHeaders, ...options.headers }
          : defaultHeaders,
        body: options.body,
      });
    } catch (error) {
      throw new CommunicationError(
        0,
        error instanceof Error ? error.message : String(error)
      );
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
      const responseData = await response.text();
      throw new CommunicationError(response.status, responseData);
    }

    const data = (await response.json()) as Data;
    const isValid = this.isValidResponse(response, data);

    return {
      status: response.status,
      success: isValid,
      data,
    };
  }

  private isValidResponse(
    { ok, status }: Pick<Response, 'ok' | 'status'>,
    data: unknown
  ): boolean {
    return ok || status === 304 || (status === 0 && !!data);
  }
}
