/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { util as forgeUtil } from 'node-forge';
import { version, author } from '../../../package.json';
import type { Metadata } from '../encryption/types';

export const Util = {
  getMetadata(
    screenSize: string,
    platformIdentifier: string,
    appIdentifier?: string,
    deviceBrand = '',
    deviceType = '',
    sdkIdentifierPrefix = ''
  ): Metadata {
    return {
      screenSize,
      platformIdentifier,
      sdkIdentifier: `${sdkIdentifierPrefix}ReactNativeClientSDK/v${version}`,
      sdkCreator: author,
      appIdentifier: appIdentifier ?? '',
      deviceBrand,
      deviceType,
    };
  },

  base64UrlEncode(data: string): string {
    const base64 = forgeUtil.encode64(data);

    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/[=]+$/g, '');
  },
};
