/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DefaultDeviceInformationProvider } from '../../../src/infrastructure/DefaultDeviceInformationProvider';
import { version, author } from '../../../package.json';

// Use vi.hoisted so these variables are available when vi.mock factory is hoisted
const { mockPlatform, mockDimensions } = vi.hoisted(() => {
  const platformMock = {
    OS: 'ios' as 'ios' | 'android',
    Version: '17.0' as string | number,
    constants: { interfaceIdiom: 'phone' } as Record<string, unknown>,
  };

  const dimensionsMock = {
    width: 390,
    height: 844,
  };

  return {
    mockPlatform: platformMock,
    mockDimensions: dimensionsMock,
  };
});

vi.mock('react-native', () => ({
  Platform: mockPlatform,
  Dimensions: {
    get: (_dim: string) => ({
      width: mockDimensions.width,
      height: mockDimensions.height,
    }),
  },
}));

describe('DefaultDeviceInformationProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // Reset to iOS defaults
    mockPlatform.OS = 'ios';
    mockPlatform.Version = '17.0';
    mockPlatform.constants = { interfaceIdiom: 'phone' };
    mockDimensions.width = 390;
    mockDimensions.height = 844;
  });

  describe('getMetadata', () => {
    describe('on iOS', () => {
      beforeEach(() => {
        mockPlatform.OS = 'ios';
        mockPlatform.Version = '17.0';
        mockPlatform.constants = { interfaceIdiom: 'phone' };
        mockDimensions.width = 390;
        mockDimensions.height = 844;
      });

      it('should return correct platformIdentifier for iOS', () => {
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.platformIdentifier).toBe('ios/17.0');
      });

      it('should return correct screenSize for iOS', () => {
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.screenSize).toBe('390x844');
      });

      it('should return correct sdkIdentifier for iOS', () => {
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.sdkIdentifier).toBe(`ReactNativeClientSDK/v${version}`);
      });

      it('should use package.json author as sdkCreator and appIdentifier when provided on iOS', () => {
        const provider = new DefaultDeviceInformationProvider({
          appIdentifier: 'MyiOSApp/1.0',
        });

        const metadata = provider.getMetadata();

        expect(metadata.sdkCreator).toBe(author);
        expect(metadata.appIdentifier).toBe('MyiOSApp/1.0');
      });

      it('should use package.json author as sdkCreator and empty string for appIdentifier when no appIdentifier on iOS', () => {
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.sdkCreator).toBe(author);
        expect(metadata.appIdentifier).toBe('');
      });

      it('should handle numeric iOS version correctly', () => {
        mockPlatform.Version = 17;

        const provider = new DefaultDeviceInformationProvider();
        const metadata = provider.getMetadata();

        expect(metadata.platformIdentifier).toBe('ios/17');
      });

      it('should round fractional screen dimensions on iOS', () => {
        mockDimensions.width = 390.6;
        mockDimensions.height = 844.3;

        const provider = new DefaultDeviceInformationProvider();
        const metadata = provider.getMetadata();

        expect(metadata.screenSize).toBe('391x844');
      });

      it('should return deviceBrand Apple on iOS', () => {
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.deviceBrand).toBe('Apple');
      });

      it('should return deviceType iPhone when interfaceIdiom is phone', () => {
        mockPlatform.constants = { interfaceIdiom: 'phone' };
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.deviceType).toBe('iPhone');
      });

      it('should return deviceType iPad when interfaceIdiom is pad', () => {
        mockPlatform.constants = { interfaceIdiom: 'pad' };
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.deviceType).toBe('iPad');
      });

      it('should return deviceType Mac when interfaceIdiom is mac', () => {
        mockPlatform.constants = { interfaceIdiom: 'mac' };
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.deviceType).toBe('Mac');
      });

      it('should fall back to iPhone deviceType when interfaceIdiom is unknown', () => {
        mockPlatform.constants = { interfaceIdiom: 'unknown-future-value' };
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.deviceType).toBe('iPhone');
      });
    });

    describe('on Android', () => {
      beforeEach(() => {
        mockPlatform.OS = 'android';
        mockPlatform.Version = 33;
        mockPlatform.constants = { Manufacturer: 'Google', Model: 'Pixel 9' };
        mockDimensions.width = 412;
        mockDimensions.height = 915;
      });

      it('should return correct platformIdentifier for Android', () => {
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.platformIdentifier).toBe('android/33');
      });

      it('should return correct screenSize for Android', () => {
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.screenSize).toBe('412x915');
      });

      it('should return correct sdkIdentifier for Android', () => {
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.sdkIdentifier).toBe(`ReactNativeClientSDK/v${version}`);
      });

      it('should use package.json author as sdkCreator and appIdentifier when provided on Android', () => {
        const provider = new DefaultDeviceInformationProvider({
          appIdentifier: 'MyAndroidApp/2.0',
        });

        const metadata = provider.getMetadata();

        expect(metadata.sdkCreator).toBe(author);
        expect(metadata.appIdentifier).toBe('MyAndroidApp/2.0');
      });

      it('should use package.json author as sdkCreator and empty string for appIdentifier when no appIdentifier on Android', () => {
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.sdkCreator).toBe(author);
        expect(metadata.appIdentifier).toBe('');
      });

      it('should handle string Android version correctly', () => {
        mockPlatform.Version = '13';

        const provider = new DefaultDeviceInformationProvider();
        const metadata = provider.getMetadata();

        expect(metadata.platformIdentifier).toBe('android/13');
      });

      it('should round fractional screen dimensions on Android', () => {
        mockDimensions.width = 412.4;
        mockDimensions.height = 915.7;

        const provider = new DefaultDeviceInformationProvider();
        const metadata = provider.getMetadata();

        expect(metadata.screenSize).toBe('412x916');
      });

      it('should return deviceBrand from Manufacturer on Android', () => {
        mockPlatform.constants = {
          Manufacturer: 'Samsung',
          Model: 'Galaxy S24',
        };
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.deviceBrand).toBe('Samsung');
      });

      it('should return deviceType from Model on Android', () => {
        mockPlatform.constants = {
          Manufacturer: 'Samsung',
          Model: 'Galaxy S24',
        };
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.deviceType).toBe('Galaxy S24');
      });

      it('should fall back to "unknown" deviceBrand when Manufacturer is missing', () => {
        mockPlatform.constants = {};
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.deviceBrand).toBe('unknown');
      });

      it('should fall back to "unknown" deviceType when Model is missing', () => {
        mockPlatform.constants = {};
        const provider = new DefaultDeviceInformationProvider();

        const metadata = provider.getMetadata();

        expect(metadata.deviceType).toBe('unknown');
      });
    });

    describe('cross-platform', () => {
      it('should return the same sdkIdentifier regardless of platform', () => {
        mockPlatform.OS = 'ios';
        mockPlatform.Version = '17.0';
        mockPlatform.constants = { interfaceIdiom: 'phone' };
        const iosProvider = new DefaultDeviceInformationProvider();
        const iosMetadata = iosProvider.getMetadata();

        mockPlatform.OS = 'android';
        mockPlatform.Version = 33;
        mockPlatform.constants = { Manufacturer: 'Google', Model: 'Pixel 9' };
        const androidProvider = new DefaultDeviceInformationProvider();
        const androidMetadata = androidProvider.getMetadata();

        expect(iosMetadata.sdkIdentifier).toBe(androidMetadata.sdkIdentifier);
        expect(iosMetadata.sdkIdentifier).toBe(
          `ReactNativeClientSDK/v${version}`
        );
      });

      it('should reflect different screen sizes between platforms', () => {
        mockPlatform.OS = 'ios';
        mockPlatform.constants = { interfaceIdiom: 'phone' };
        mockDimensions.width = 390;
        mockDimensions.height = 844;
        const iosProvider = new DefaultDeviceInformationProvider();
        const iosMetadata = iosProvider.getMetadata();

        mockPlatform.OS = 'android';
        mockPlatform.constants = { Manufacturer: 'Google', Model: 'Pixel 9' };
        mockDimensions.width = 412;
        mockDimensions.height = 915;
        const androidProvider = new DefaultDeviceInformationProvider();
        const androidMetadata = androidProvider.getMetadata();

        expect(iosMetadata.screenSize).toBe('390x844');
        expect(androidMetadata.screenSize).toBe('412x915');
        expect(iosMetadata.screenSize).not.toBe(androidMetadata.screenSize);
      });

      it('should always return all required metadata fields', () => {
        for (const [os, version_, constants] of [
          ['ios', '17.0', { interfaceIdiom: 'phone' }],
          ['android', 33, { Manufacturer: 'Google', Model: 'Pixel 9' }],
        ] as const) {
          mockPlatform.OS = os;
          mockPlatform.Version = version_;
          mockPlatform.constants = constants;

          const provider = new DefaultDeviceInformationProvider();
          const metadata = provider.getMetadata();

          expect(metadata).toHaveProperty('screenSize');
          expect(metadata).toHaveProperty('platformIdentifier');
          expect(metadata).toHaveProperty('sdkIdentifier');
          expect(metadata).toHaveProperty('sdkCreator');
          expect(metadata).toHaveProperty('appIdentifier');
          expect(metadata).toHaveProperty('deviceBrand');
          expect(metadata).toHaveProperty('deviceType');
        }
      });
    });
  });
});
