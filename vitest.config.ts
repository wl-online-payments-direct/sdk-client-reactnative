import { defineConfig } from 'vitest/config';
import path from 'path';

const reactNativeMock = path.resolve(
  __dirname,
  './__tests__/__mocks__/react-native.ts'
);

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '__tests__/', 'dist/'],
    },
    projects: [
      {
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
            'react-native': reactNativeMock,
          },
        },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['__tests__/unit/**/*.test.ts'],
        },
      },
      {
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
            'react-native': reactNativeMock,
          },
        },
        test: {
          name: 'integration',
          environment: 'node',
          include: ['__tests__/integration/**/*.test.ts'],
          setupFiles: ['./__tests__/integration/setup.ts'],
          testTimeout: 30000,
        },
      },
    ],
  },
});
