/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { describe, expect, it } from 'vitest';
import { Util } from '../../../../src/infrastructure/utils/Util';
import { version } from '../../../../package.json';

describe('getMetadata', () => {
  const screenSize = '390x844';
  const platformIdentifier = 'ios';

  it('returns metadata with the provided appIdentifier', () => {
    const metadata = Util.getMetadata(screenSize, platformIdentifier, 'my-app');

    expect(metadata.screenSize).toBe(screenSize);
    expect(metadata.platformIdentifier).toBe(platformIdentifier);
    expect(metadata.appIdentifier).toBe('my-app');
  });

  it('uses an empty string as appIdentifier when no appIdentifier is provided', () => {
    const metadata = Util.getMetadata(screenSize, platformIdentifier);

    expect(metadata.appIdentifier).toBe('');
  });

  it('prefixes sdkIdentifier when sdkIdentifierPrefix is provided', () => {
    const metadata = Util.getMetadata(
      screenSize,
      platformIdentifier,
      undefined,
      '',
      '',
      'rpp-'
    );

    expect(metadata.sdkIdentifier).toBe(`rpp-ReactNativeClientSDK/v${version}`);
  });

  it('uses the default React Native sdkIdentifier when no prefix is provided', () => {
    const metadata = Util.getMetadata(screenSize, platformIdentifier);

    expect(metadata.sdkIdentifier).toBe(`ReactNativeClientSDK/v${version}`);
  });

  it('returns device brand and device type when provided', () => {
    const metadata = Util.getMetadata(
      screenSize,
      platformIdentifier,
      'my-app',
      'Apple',
      'iPhone'
    );

    expect(metadata.deviceBrand).toBe('Apple');
    expect(metadata.deviceType).toBe('iPhone');
  });
});

describe('base64UrlEncode', () => {
  it('returns a Base64 URL-encoded string with no padding characters', () => {
    const result = Util.base64UrlEncode('hello world');

    expect(result).toBe('aGVsbG8gd29ybGQ');
    expect(result).not.toContain('+');
    expect(result).not.toContain('/');
    expect(result).not.toContain('=');
  });
});
