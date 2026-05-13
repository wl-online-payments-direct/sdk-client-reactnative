import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';

export default [
  {
    input: `src/index.ts`,
    plugins: [json(), esbuild()],
    output: [
      {
        file: `dist/bundle.esm.js`,
        format: 'esm',
        sourcemap: true,
      },
      {
        file: `dist/bundle.cjs.js`,
        format: 'cjs',
        sourcemap: true,
      },
    ],
  },
  {
    input: `src/index.ts`,
    plugins: [dts()],
    output: {
      file: `dist/bundle.d.ts`,
      format: 'es',
    },
  },
];
