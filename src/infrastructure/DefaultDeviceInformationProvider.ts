/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { Dimensions, Platform } from 'react-native';
import type { SdkConfiguration } from '../domain';
import type { DeviceInformationProvider } from './interfaces/DeviceInformationProvider';
import type { Metadata } from './encryption/types';
import { Util } from './utils/Util';

export class DefaultDeviceInformationProvider implements DeviceInformationProvider {
  constructor(private readonly configuration?: SdkConfiguration) {}

  getMetadata(): Metadata {
    const { width, height } = Dimensions.get('window');

    const screenSize = `${Math.round(width)}x${Math.round(height)}`;
    const platformIdentifier = `${Platform.OS}/${String(Platform.Version)}`;
    const { deviceBrand, deviceType } = this.getDeviceInfo();

    return Util.getMetadata(
      screenSize,
      platformIdentifier,
      this.configuration?.appIdentifier,
      deviceBrand,
      deviceType
    );
  }

  private getDeviceInfo(): { deviceBrand: string; deviceType: string } {
    if (Platform.OS === 'ios') {
      const constants = Platform.constants as unknown as {
        interfaceIdiom?: string;
      };

      let deviceType = 'iPhone';
      if (constants.interfaceIdiom === 'pad') {
        deviceType = 'iPad';
      } else if (constants.interfaceIdiom === 'mac') {
        deviceType = 'Mac';
      }

      return { deviceBrand: 'Apple', deviceType };
    }

    const constants = Platform.constants as unknown as {
      Manufacturer?: string;
      Model?: string;
    };

    return {
      deviceBrand: constants.Manufacturer ?? 'unknown',
      deviceType: constants.Model ?? 'unknown',
    };
  }
}
