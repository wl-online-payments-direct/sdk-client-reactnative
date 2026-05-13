import type { Metadata } from '../encryption/types';

export interface DeviceInformationProvider {
  getMetadata(): Metadata;
}
