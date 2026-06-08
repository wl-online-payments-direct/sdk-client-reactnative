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

import type { AccountOnFileDto } from '../../src/infrastructure/apiModels/accountOnFile/AccountOnFileDto';
import { AccountOnFileAttributeStatus } from '../../src';

export const accountOnFileJson: AccountOnFileDto = {
  attributes: [
    {
      key: 'alias',
      status: AccountOnFileAttributeStatus.READ_ONLY,
      value: '411111XXXXXX1111',
    },
    {
      key: 'cardNumber',
      status: AccountOnFileAttributeStatus.READ_ONLY,
      value: '9999-9999-9999-9999',
    },
    {
      key: 'cvv',
      status: AccountOnFileAttributeStatus.MUST_WRITE,
      value: '',
    },
  ],
  displayHints: {
    labelTemplate: [
      {
        attributeKey: 'alias',
        mask: '{{9999}} {{9999}} {{9999}} {{9999}} {{999}}',
      },
    ],
    logo: 'test-logo',
  },
  id: '1234',
  paymentProductId: 1,
};

export const accountOnFileJson2: AccountOnFileDto = {
  attributes: [
    {
      key: 'alias',
      status: AccountOnFileAttributeStatus.READ_ONLY,
      value: 'test label',
    },
    {
      key: 'cardNumber',
      status: AccountOnFileAttributeStatus.CAN_WRITE,
      value: '9999-9999-9999-9999',
    },
  ],
  displayHints: {
    labelTemplate: [
      {
        attributeKey: 'alias',
        mask: '',
      },
    ],
    logo: 'test-logo',
  },
  id: '5678',
  paymentProductId: 2,
};

export const accountOnFileWithMustWriteCvvJson: AccountOnFileDto = {
  attributes: [
    {
      key: 'cardNumber',
      value: '************7977',
      status: AccountOnFileAttributeStatus.READ_ONLY,
    },
    {
      key: 'cardholderName',
      value: 'Darwin Núñez',
      status: AccountOnFileAttributeStatus.CAN_WRITE,
    },
    {
      key: 'expiryDate',
      value: '1230',
      status: AccountOnFileAttributeStatus.CAN_WRITE,
    },
    {
      key: 'cvv',
      value: '',
      status: AccountOnFileAttributeStatus.MUST_WRITE,
    },
  ],
  displayHints: {
    labelTemplate: [
      {
        attributeKey: 'alias',
        mask: '',
      },
    ],
    logo: 'test-logo',
  },
  id: '5678',
  paymentProductId: 2,
};

export const accountOnFileWithCardHolderNameCanWriteJson: AccountOnFileDto = {
  attributes: [
    {
      key: 'cardholderName',
      value: 'test',
      status: AccountOnFileAttributeStatus.CAN_WRITE,
    },
  ],
  displayHints: {
    labelTemplate: [
      {
        attributeKey: 'alias',
        mask: '',
      },
    ],
    logo: 'test-logo',
  },
  id: '5678',
  paymentProductId: 2,
};
