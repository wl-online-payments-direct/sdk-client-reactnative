import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const external = ['react', 'react-native'];

const NODE_BUILTIN_STUB = '\0node-builtin-stub';
const stubNodeBuiltins = {
  name: 'stub-node-builtins',
  resolveId(id) {
    return id === 'crypto' ? NODE_BUILTIN_STUB : null;
  },
  load(id) {
    return id === NODE_BUILTIN_STUB ? 'export default null;' : null;
  },
};

export default [
  {
    input: `src/index.ts`,
    external,
    plugins: [stubNodeBuiltins, resolve(), commonjs(), json(), esbuild()],
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
    external,
    plugins: [dts()],
    output: {
      file: `dist/bundle.d.ts`,
      format: 'es',
    },
  },
];
