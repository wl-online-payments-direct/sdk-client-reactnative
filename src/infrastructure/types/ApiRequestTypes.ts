/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

export type ApiHeaderValue = string;

export type ApiHeaders = Record<string, ApiHeaderValue>;

export type ApiBody = string;

export type ApiQueryParamValue = string | number | boolean | undefined;

export type ApiQueryParams = Record<string, ApiQueryParamValue>;

export interface ApiRequestOptions {
  headers?: ApiHeaders;
}

export interface ApiPostRequestOptions extends ApiRequestOptions {
  body?: ApiBody;
}

export interface ApiContextRequestOptions extends ApiRequestOptions {
  queryParams?: ApiQueryParams;
  useCacheBuster?: boolean;
}

export interface ApiContextPostRequestOptions extends ApiContextRequestOptions {
  body?: ApiBody;
}
