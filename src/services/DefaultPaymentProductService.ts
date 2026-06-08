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

import type { PaymentProductFactory } from '../infrastructure/interfaces/PaymentProductFactory';
import type { ApiClient } from '../infrastructure/interfaces/ApiClient';

import type { CacheManager } from '../infrastructure/utils/CacheManager';
import type { PaymentProductService } from './interfaces/PaymentProductService';
import { SupportedProductsUtil } from '../infrastructure/utils/SupportedProductsUtil';
import { BaseService } from './BaseService';
import type { ApplePay } from './models/ApplePay';
import {
  BasicPaymentProducts,
  type PaymentContext,
  PaymentProduct,
  ResponseError,
} from '../domain';
import type { BasicPaymentProductsDto } from '../infrastructure/apiModels/paymentProduct/BasicPaymentProductsDto';
import type { PaymentProductDto } from '../infrastructure/apiModels/paymentProduct/PaymentProductDto';
import type { PaymentProductNetworksResponse } from '../domain/paymentProduct/PaymentProductNetworksResponse';

export class DefaultPaymentProductService
  extends BaseService
  implements PaymentProductService
{
  constructor(
    cacheManager: CacheManager,
    apiClient: ApiClient,
    private readonly paymentProductFactory: PaymentProductFactory,
    private readonly applePay: ApplePay
  ) {
    super(cacheManager, apiClient);
  }

  async getBasicPaymentProducts(
    context: PaymentContext
  ): Promise<BasicPaymentProducts> {
    const cacheKey = this.cacheManager.createCacheKeyFromContext({
      prefix: 'basicPaymentProducts',
      context,
    });

    if (this.cacheManager.has(cacheKey)) {
      return this.cacheManager.get<BasicPaymentProducts>(cacheKey)!;
    }

    const response =
      await this.apiClient.getWithContext<BasicPaymentProductsDto>(
        '/products',
        context
      );

    this.validateResponse(
      response,
      'Error while trying to fetch basic payment products.'
    );

    SupportedProductsUtil.filterOutSdkUnsupportedProducts(response.data);

    if (!(await this.applePay.isApplePayAvailable())) {
      response.data.paymentProducts = response.data.paymentProducts?.filter(
        ({ id }) => id !== SupportedProductsUtil.applePayPaymentProductId
      );
    }

    if (!response.data.paymentProducts?.length) {
      throw new ResponseError(
        SupportedProductsUtil.get404Error(),
        404,
        'No payment products available'
      );
    }

    const products = this.paymentProductFactory.createBasicPaymentProducts(
      response.data
    );

    this.cacheManager.set(cacheKey, products);

    return products;
  }

  async getPaymentProduct(
    paymentProductId: number,
    context: PaymentContext
  ): Promise<PaymentProduct> {
    if (!SupportedProductsUtil.isSupportedInSdk(paymentProductId)) {
      throw new ResponseError(
        SupportedProductsUtil.get404Error(),
        404,
        'Product not found or not available.'
      );
    }

    if (
      paymentProductId === SupportedProductsUtil.applePayPaymentProductId &&
      !(await this.applePay.isApplePayAvailable())
    ) {
      throw new ResponseError(
        SupportedProductsUtil.get404Error(),
        404,
        'Product not found or not available.'
      );
    }

    const cacheKey = this.cacheManager.createCacheKeyFromContext({
      prefix: `paymentProduct-${paymentProductId}`,
      context,
    });

    if (this.cacheManager.has(cacheKey)) {
      return this.cacheManager.get<PaymentProduct>(cacheKey)!;
    }

    const response = await this.apiClient.getWithContext<PaymentProductDto>(
      `/products/${paymentProductId}`,
      context
    );

    this.validateResponse(
      response,
      `Error while trying to fetch the payment product ${paymentProductId}.`
    );

    const product = this.paymentProductFactory.createPaymentProduct(
      response.data
    );

    this.cacheManager.set(cacheKey, product);

    return product;
  }

  async getPaymentProductNetworks(
    paymentProductId: number,
    context: PaymentContext
  ): Promise<PaymentProductNetworksResponse> {
    const cacheKey = this.cacheManager.createCacheKeyFromContext({
      prefix: `paymentProductNetworks-${paymentProductId}`,
      context,
    });

    if (this.cacheManager.has(cacheKey)) {
      return this.cacheManager.get<PaymentProductNetworksResponse>(cacheKey)!;
    }

    const response =
      await this.apiClient.getWithContext<PaymentProductNetworksResponse>(
        `/products/${paymentProductId}/networks`,
        context
      );

    this.validateResponse(
      response,
      `Error while trying to fetch payment product networks for product with id ${paymentProductId}.`
    );

    this.cacheManager.set(cacheKey, response.data);

    return response.data;
  }
}
