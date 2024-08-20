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

import type { AccountOnFile } from './account-on-file/AccountOnFile';
import {
  BasicPaymentProduct,
  type BasicPaymentProductJSON,
} from './BasicPaymentProduct';

export interface BasicPaymentProductsJSON {
  paymentProducts?: BasicPaymentProductJSON[];
}

/**
 * Contains a list of {@link BasicPaymentProduct}, a list of {@link AccountOnFile} and helper methods to retrieve a specific {@link BasicPaymentProduct} object.
 */
export class BasicPaymentProducts {
  readonly accountsOnFile: AccountOnFile[];
  readonly basicPaymentProducts: BasicPaymentProduct[] = [];

  constructor(json: BasicPaymentProductsJSON) {
    const basicPaymentProductsJSON = json.paymentProducts ?? [];
    for (var basicPaymentProductJSON of basicPaymentProductsJSON) {
      this.basicPaymentProducts.push(
        new BasicPaymentProduct(basicPaymentProductJSON)
      );
    }
    this.accountsOnFile = this._getAccountsOnFile();
  }

  private _getAccountsOnFile(): AccountOnFile[] {
    return this.basicPaymentProducts.flatMap(
      (product) => product.accountsOnFile
    );
  }

  /**
   * @param id for which the {@link BasicPaymentProduct} should be returned
   * @returns the {@link BasicPaymentProduct} with the corresponding {@link id}, or {@link undefined} if not found
   */
  getBasicPaymentProductById(id: string): BasicPaymentProduct | undefined {
    for (var product of this.basicPaymentProducts) {
      if (product.id === id) {
        return product;
      }
    }
    return undefined;
  }

  /**
   * @param accountOnFileId for which the {@link BasicPaymentProduct} should be returned
   * @returns the {@link BasicPaymentProduct} which has an {@link AccountOnFile} with the corresponding {@link accountOnFileId}, or {@link undefined} if not found
   */
  getBasicPaymentProductByAccountOnFileId(
    accountOnFileId: string
  ): BasicPaymentProduct | undefined {
    for (var product of this.basicPaymentProducts) {
      for (var aof of product.accountsOnFile) {
        if (aof.id === accountOnFileId) {
          return product;
        }
      }
    }
    return undefined;
  }
}
